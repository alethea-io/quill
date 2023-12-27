import { encodeHex } from "https://deno.land/std@0.209.0/encoding/hex.ts";
import type { JsonValue } from "npm:@bufbuild/protobuf";
import * as UtxoRpc from "npm:@utxorpc-web/cardano-spec";
import { C, slotToTimestamp } from "../../../lib/mod.ts";

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

type AddressState = {
  bech32: string;
  raw: Uint8Array;
  balance: bigint;
  tx_count: bigint;
  tx_count_as_source: bigint;
  tx_count_as_dest: bigint;
  utxo_count: bigint;
};

function processTxOutput(
  txOutput: UtxoRpc.TxOutput,
  addressType: string,
  action: Action,
  addressState: Map<string, AddressState>,
  addresses: Set<string>,
) {
  const address = C.Address.from_bytes(txOutput.address);

  let bech32: string;
  let raw: Uint8Array;

  switch (addressType) {
    case "payment":
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

      raw = txOutput.address;

      break;
    case "stake":
      if (address.as_base()) {
        const network_id = address.network_id();
        const stake_cred = address.as_base()?.stake_cred();

        const stake_address = C.RewardAddress
          // @ts-ignore: checked if address.as_base() is undefined
          .new(network_id, stake_cred)
          .to_address();

        bech32 = stake_address.to_bech32(undefined);

        raw = stake_address.to_bytes();
      } else {
        return;
      }
      break;
    default:
      throw new Error(`address type "${addressType}" not implemented!`);
  }

  addresses.add(bech32);

  let amount;
  let count;
  switch (action) {
    case Action.Consume:
      amount = -txOutput.coin;
      count = -1n;
      break;
    case Action.Produce:
      amount = txOutput.coin;
      count = 1n;
      break;
  }

  const existingState = addressState.get(bech32);
  if (existingState) {
    existingState.balance += amount;
    existingState.utxo_count += count;
    addressState.set(bech32, existingState);
  } else {
    addressState.set(bech32, {
      bech32: bech32,
      raw: raw,
      balance: amount,
      tx_count: 0n,
      tx_count_as_source: 0n,
      tx_count_as_dest: 0n,
      utxo_count: count,
    });
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

  const addressState = new Map<string, AddressState>();

  for (const tx of block.body?.tx ?? []) {
    const sourceAddresses = new Set<string>();
    const destAddresses = new Set<string>();

    for (const txOutput of tx.outputs) {
      const action = method === Method.Apply ? Action.Produce : Action.Consume;
      processTxOutput(
        txOutput,
        addressType,
        action,
        addressState,
        destAddresses,
      );
    }

    for (const txInput of tx.inputs) {
      const action = method === Method.Apply ? Action.Consume : Action.Produce;
      const txOutput = txInput.asOutput;
      if (txOutput) {
        processTxOutput(
          txOutput,
          addressType,
          action,
          addressState,
          sourceAddresses,
        );
      }
    }

    (new Set([...sourceAddresses, ...destAddresses])).forEach((bech32) => {
      const state = addressState.get(bech32);
      if (state) {
        state.tx_count += method === Method.Apply ? 1n : -1n;
        addressState.set(bech32, state);
      }
    });
    sourceAddresses.forEach((bech32) => {
      const state = addressState.get(bech32);
      if (state) {
        state.tx_count_as_source += method === Method.Apply ? 1n : -1n;
        addressState.set(bech32, state);
      }
    });
    destAddresses.forEach((bech32) => {
      const state = addressState.get(bech32);
      if (state) {
        state.tx_count_as_dest += method === Method.Apply ? 1n : -1n;
        addressState.set(bech32, state);
      }
    });
  }

  const values = Array.from(addressState.values());

  if (values.length > 0) {
    const addresses = values.map((value) => `'${value.bech32}'`).join(",");
    const addressesRaw = values.map((value) =>
      `decode('${encodeHex(value.raw)}', 'hex')`
    ).join(",");
    const balances = values.map((value) => `${value.balance}`).join(",");
    const txCounts = values.map((value) => `${value.tx_count}`).join(",");
    const sourceCounts = values.map((value) => `${value.tx_count_as_source}`)
      .join(",");
    const destCounts = values.map((value) => `${value.tx_count_as_dest}`).join(
      ",",
    );
    const utxoCounts = values.map((value) => `${value.utxo_count}`).join(",");

    const table = addressType == AddressType.Payment
      ? "address_state"
      : "stake_address_state";

    const inserted = `
      INSERT INTO scrolls.${table} (
        bech32,
        raw,
        balance,
        utxo_count,
        tx_count,
        tx_count_as_source,
        tx_count_as_dest,
        first_tx_time,
        last_tx_time
      )
      SELECT  unnest(ARRAY[${addresses}]) AS bech32,
              unnest(ARRAY[${addressesRaw}]) AS raw,
              unnest(ARRAY[${balances}]) AS balance,
              unnest(ARRAY[${utxoCounts}]) AS utxo_count,
              unnest(ARRAY[${txCounts}]) AS tx_count,
              unnest(ARRAY[${sourceCounts}]) AS tx_count_as_source,
              unnest(ARRAY[${destCounts}]) AS tx_count_as_dest,
              '${blockTime}'::timestamptz AS first_tx_time,
              '${blockTime}'::timestamptz AS last_tx_time
      ON CONFLICT (bech32) DO UPDATE
      SET balance = ${table}.balance + EXCLUDED.balance,
          utxo_count = ${table}.utxo_count + EXCLUDED.utxo_count,
          tx_count = ${table}.tx_count + EXCLUDED.tx_count,
          tx_count_as_source = ${table}.tx_count_as_source + EXCLUDED.tx_count_as_source,
          tx_count_as_dest = ${table}.tx_count_as_dest + EXCLUDED.tx_count_as_dest,
          last_tx_time = EXCLUDED.last_tx_time
    `;

    const deleted = `
      DELETE FROM scrolls.${table}
      WHERE bech32 IN (${addresses})
        AND tx_count = 0
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
