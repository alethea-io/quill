import { encodeHex } from "https://deno.land/std@0.209.0/encoding/hex.ts";
import type { JsonValue } from "npm:@bufbuild/protobuf";
import * as UtxoRpc from "npm:@utxorpc-web/cardano-spec";
import { assetFingerprint, C, slotToTimestamp } from "../../../lib/mod.ts";

enum Method {
  Apply = "apply",
  Undo = "undo",
}

enum Action {
  Produce = "produce",
  Consume = "consume",
}

enum AddressType {
  Payment = "payment",
  Stake = "stake",
}

function toAddressType(value: string): AddressType | undefined {
  return Object.values(AddressType).find((type) => type === value) as
    | AddressType
    | undefined;
}

type AddressTokenState = {
  bech32: string;
  fingerprint: string;
  balance: bigint;
};

function processTxOutput(
  txOutput: UtxoRpc.TxOutput,
  addressType: AddressType,
  action: Action,
  addressTokenState: Map<string, AddressTokenState>,
) {
  const address = C.Address.from_bytes(txOutput.address);

  let bech32: string;

  switch (addressType) {
    case AddressType.Payment:
      if (address.as_byron()) {
        // @ts-ignore: checked if address.as_byron() is undefined
        bech32 = address.as_byron()?.to_base58();
      } else if (address.to_bech32(undefined)) {
        bech32 = address.to_bech32(undefined);
      } else {
        throw new Error(
          `address "${encodeHex(txOutput.address)}" could not be parsed!`,
        );
      }
      break;
    case AddressType.Stake:
      if (address.as_base()) {
        const network_id = address.network_id();
        const stake_cred = address.as_base()?.stake_cred();

        const stake_address = C.RewardAddress
          // @ts-ignore: checked if address.as_base() is undefined
          .new(network_id, stake_cred)
          .to_address();

        bech32 = stake_address.to_bech32(undefined);
      } else {
        return;
      }
      break;
    default:
      throw new Error(`address type "${addressType}" not implemented!`);
  }

  let fingerprint;
  for (const multiasset of txOutput.assets ?? []) {
    for (const asset of multiasset.assets) {
      fingerprint = assetFingerprint(multiasset.policyId, asset.name);

      const balance = action === Action.Produce
        ? asset.outputCoin
        : -asset.outputCoin;

      const existingState = addressTokenState.get(bech32 + fingerprint);
      if (existingState) {
        existingState.balance += balance;
        addressTokenState.set(bech32 + fingerprint, existingState);
      } else {
        addressTokenState.set(bech32 + fingerprint, {
          bech32,
          fingerprint,
          balance,
        });
      }
    }
  }
}

function processBlock(
  blockJson: JsonValue,
  config: Record<string, string>,
  method: Method,
) {
  const block = UtxoRpc.Block.fromJson(blockJson);
  const blockTime = slotToTimestamp(Number(block.header?.slot));

  const addressType = toAddressType(config.addressType);
  if (addressType === undefined) {
    throw new Error(`Invalid address type "${config.addressType}"`);
  }

  const addressTokenState = new Map<string, AddressTokenState>();

  for (const tx of block.body?.tx ?? []) {
    for (const txOutput of tx.outputs) {
      const action = method === Method.Apply ? Action.Produce : Action.Consume;
      processTxOutput(txOutput, addressType, action, addressTokenState);
    }

    for (const txInput of tx.inputs) {
      const action = method === Method.Apply ? Action.Consume : Action.Produce;
      const txOutput = txInput.asOutput;
      if (txOutput) {
        processTxOutput(txOutput, addressType, action, addressTokenState);
      }
    }
  }

  const values = Array.from(addressTokenState.values());

  if (values.length > 0) {
    const addresses = values.map((value) => `'${value.bech32}'`).join(",");
    const fingerprints = values.map((value) => `'${value.fingerprint}'`).join(
      ",",
    );
    const balances = values.map((value) => `${value.balance}`).join(",");

    const prefix = addressType == AddressType.Payment
      ? "address"
      : "stake_address";

    const inserted = `
      WITH 
      address AS (
        SELECT id, bech32 FROM scrolls.${prefix}_state WHERE bech32 IN (${addresses})
      ),
      token AS (
        SELECT id, fingerprint FROM scrolls.token_state WHERE fingerprint IN (${fingerprints})
      )
      INSERT INTO scrolls.${prefix}_token_state (
        address_id,
        token_id,
        balance,
        first_tx_time,
        last_tx_time
      )
      SELECT  address.id as address_id,
              token.id as token_id,
              addressToken.balance,
              '${blockTime}'::timestamptz AS first_tx_time,
              '${blockTime}'::timestamptz AS last_tx_time
      FROM (
        SELECT  unnest(ARRAY[${addresses}]) AS bech32,
                unnest(ARRAY[${fingerprints}]) AS fingerprint,
                unnest(ARRAY[${balances}]) AS balance
      ) as addressToken
      JOIN address ON address.bech32 = addressToken.bech32
      JOIN token ON token.fingerprint = addressToken.fingerprint
      ON CONFLICT (address_id, token_id) DO UPDATE
      SET balance = ${prefix}_token_state.balance + EXCLUDED.balance,
          last_tx_time = EXCLUDED.last_tx_time
      ;
    `;

    const deleted = `
      WITH 
      address AS (
        SELECT id, bech32 FROM scrolls.${prefix}_state WHERE bech32 IN (${addresses})
      ),
      token AS (
        SELECT id, fingerprint FROM scrolls.token_state WHERE fingerprint IN (${fingerprints})
      )
      DELETE FROM scrolls.${prefix}_token_state
      USING address, token
      WHERE address_id = address.id
        AND token_id = token.id
        AND balance = 0;
    `;

    return [inserted, deleted];
  } else {
    return [];
  }
}

export function apply(blockJson: JsonValue, config: Record<string, string>) {
  return processBlock(blockJson, config, Method.Apply);
}

export function undo(blockJson: JsonValue, config: Record<string, string>) {
  return processBlock(blockJson, config, Method.Undo);
}
