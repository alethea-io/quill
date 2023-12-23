import { encodeHex } from "https://deno.land/std@0.209.0/encoding/hex.ts";
import type { JsonValue } from "npm:@bufbuild/protobuf";
import * as UtxoRpc from "npm:@utxorpc-web/cardano-spec";
import { C, assetFingerprint } from "../../../lib/mod.ts";

enum Method {
  Apply = "apply",
  Undo = "undo",
}

enum Action {
  Produce = "produce",
  Consume = "consume",
}

type Token = {
  addresses: Set<string>;
  utxo_count: bigint;
};

type TokenState = {
  fingerprint: string;
  policy: Uint8Array;
  name: Uint8Array;
  supply: bigint;
  utxo_count: bigint;
  tx_count: bigint;
  transfer_count: bigint;
};

function processMint(
  mint: UtxoRpc.Multiasset,
  method: Method,
  tokenState: Map<string, TokenState>,
) {
  for (const asset of mint.assets) {
    const fingerprint = assetFingerprint(mint.policyId, asset.name);

    const existingState = tokenState.get(fingerprint);
    if (existingState) {
      existingState.supply += method === Method.Apply
        ? asset.mintCoin
        : -asset.mintCoin;
      tokenState.set(fingerprint, existingState);
    } else {
      tokenState.set(fingerprint, {
        fingerprint,
        policy: mint.policyId,
        name: asset.name,
        supply: asset.mintCoin,
        utxo_count: 0n,
        tx_count: 0n,
        transfer_count: 0n,
      });
    }
  }
}

function processTxOutput(
  txOutput: UtxoRpc.TxOutput,
  action: Action,
  tokenState: Map<string, TokenState>,
  addresses: Map<string, Set<string>>,
) {
  const address = C.Address.from_bytes(txOutput.address);

  let bech32: string;

  if (address.as_byron()) {
    // @ts-ignore: checked if address.as_byron() is undefined
    bech32 = address.as_byron()?.to_base58();
  } else if (address.as_base()) {
    const network_id = address.network_id();
    const stake_cred = address.as_base()?.stake_cred();

    if (stake_cred) {
      const stake_address = C.RewardAddress
        // @ts-ignore: checked if address.as_base() is undefined
        .new(network_id, stake_cred)
        .to_address();
      bech32 = stake_address.to_bech32(undefined);
    } else {
      bech32 = address.to_bech32(undefined);
    }
  } else {
    throw new Error(
      `address "${encodeHex(txOutput.address)}" could not be parsed!`,
    );
  }

  let fingerprint;
  for (const multiasset of txOutput.assets ?? []) {
    for (const asset of multiasset.assets) {
      fingerprint = assetFingerprint(multiasset.policyId, asset.name);

      const existingSet = addresses.get(fingerprint);
      if (existingSet) {
        existingSet.add(bech32)
        addresses.set(fingerprint, existingSet);
      } else {
        addresses.set(fingerprint, new Set(bech32))
      }

      const utxo_count = action === Action.Produce ? 1n : -1n;

      const existingState = tokenState.get(fingerprint);
      if (existingState) {
        existingState.utxo_count += utxo_count;
        tokenState.set(fingerprint, existingState);
      } else {
        tokenState.set(fingerprint, {
          fingerprint,
          policy: multiasset.policyId,
          name: asset.name,
          supply: 0n,
          utxo_count: utxo_count,
          tx_count: 0n,
          transfer_count: 0n,
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
  const table = config.table;

  const tokenState = new Map<string, TokenState>();

  for (const tx of block.body?.tx ?? []) {
    for (const mint of tx.mint ?? []) {
      processMint(mint, method, tokenState);
    }

    const sourceAddresses = new Map<string, Set<string>>();
    const destAddresses = new Map<string, Set<string>>();

    for (const txOutput of tx.outputs) {
      const action = method === Method.Apply ? Action.Produce : Action.Consume;
      processTxOutput(txOutput, action, tokenState, destAddresses);
    }

    for (const txInput of tx.inputs) {
      const action = method === Method.Apply ? Action.Consume : Action.Produce;
      const txOutput = txInput.asOutput;
      if (txOutput) {
        processTxOutput(txOutput, action, tokenState, sourceAddresses);
      }
    }

    const addresses = new Map<string, Set<string>>();

    const mergeSets = (set1: Set<string>, set2: Set<string>) => {
      return new Set([...set1, ...set2]);
    };
    
    for (const [key, value] of sourceAddresses) {
        addresses.set(key, new Set(value));
    }
    
    for (const [key, value] of destAddresses) {
        if (addresses.has(key)) {
            addresses.set(key, mergeSets(addresses.get(key)!, value));
        } else {
            addresses.set(key, new Set(value));
        }
    }

    for (const [fingerprint, address_set] of addresses) {
      
    }
  }

  const keys = Array.from(tokenState.keys());
  const values = Array.from(tokenState.values());

  if (keys.length > 0) {
    const fingerprints = keys.map((key) => `'${key}'`).join(",");
    const policies = values.map((value) =>
      `decode('${encodeHex(value.policy)}', 'hex')`
    ).join(",");
    const names = values.map((value) =>
      `decode('${encodeHex(value.name)}', 'hex')`
    ).join(",");
    const supplies = values.map((value) => `${value.supply}`).join(",");
    const utxoCounts = values.map((value) => `${value.utxo_count}`).join(",");
    const txCounts = values.map((value) => `${value.tx_count}`).join(",");
    const transferCounts = values.map((value) => `${value.transfer_count}`).join(",");

    const inserted = `
      INSERT INTO scrolls.${table} (
        fingerprint,
        policy,
        name,
        supply,
        utxo_count,
        tx_count,
        transfer_count
      )
      SELECT unnest(ARRAY[${fingerprints}]) AS fingerprint,
              unnest(ARRAY[${policies}]) AS policy,
              unnest(ARRAY[${names}]) AS name,
              unnest(ARRAY[${supplies}]) AS supply,
              unnest(ARRAY[${utxoCounts}]) AS utxo_count,
              unnest(ARRAY[${txCounts}]) AS tx_count,
              unnest(ARRAY[${transferCounts}]) AS transfer_count
      ON CONFLICT (fingerprint) DO UPDATE
      SET supply = ${table}.supply + EXCLUDED.supply,
          utxo_count = ${table}.utxo_count + EXCLUDED.utxo_count,
          tx_count = ${table}.tx_count + EXCLUDED.tx_count,
          transfer_count = ${table}.transfer_count + EXCLUDED.transfer_count
    `

    const deleted = `
      DELETE FROM scrolls.${table}
      WHERE fingerprint IN (${fingerprints})
        AND tx_count = 0
    `

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
