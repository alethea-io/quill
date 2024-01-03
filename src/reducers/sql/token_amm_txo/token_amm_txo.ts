import type { JsonValue } from "npm:@bufbuild/protobuf";
import * as UtxoRpc from "npm:@utxorpc-web/cardano-spec";
import { C, slotToTimestamp } from "../../../lib/mod.ts";

enum Method {
  Apply = "apply",
  Undo = "undo",
}

type AmmTxo = {
  dex: string;
  address: string;
  value: bigint;
  token1_subject: Uint8Array;
  token1_name: Uint8Array;
  token1_quantity: number;
  token2_subject: Uint8Array;
  token2_name: Uint8Array;
  token2_quantity: number
};

function getPolicy(dex: string) {
  switch(dex) {
    case "Minswap":
    case "SundaeSwap":
    case "Wingriders":
    case "Spectrum":
  }
}

function processTxOutput(txOutput: UtxoRpc.TxOutput, dex: string): AmmTxo | null {
  if (txOutput.datum?.plutusData?.value instanceof UtxoRpc.PlutusDataMap) {
    const address = C.Address.from_bytes(txOutput.address).to_bech32(undefined);
    const datum: UtxoRpc.PlutusDataMap = txOutput.datum.plutusData.value;

    switch(dex) {
      case "Minswap":
        console.log(txOutput.datum);
        return {
          dex,
          address,
          token1_subject: datum.,
          token1_name: [],
          token1_quantity: 0,
          token2_subject: [],
          token2_name: [],
          token2_quantity: 0,
        }
        // return {
        //   token1_policy: datum.map.value->'fields'->0->'fields'->0->>'bytes',
        //   token1_name: datum.value->'fields'->0->'fields'->1->>'bytes',
        //   token2_policy: datum.value->'fields'->1->'fields'->0->>'bytes',
        //   token2_name: datum.value->'fields'->1->'fields'->1->>'bytes',
        // }
      case "SundaeSwap":
      case "Wingriders":
      case "Spectrum":
      default:
        throw new Error(`dex type "${dex}" not implemented!`);
    }

  } else {
    return null;
  }
}

function processBlock(
  blockJson: JsonValue,
  config: Record<string, string>,
  method: Method,
) {
  const block = UtxoRpc.Block.fromJson(blockJson);
  const blockTime = slotToTimestamp(Number(block.header?.slot));
  const dex = config.dex;

  let txos: AmmTxo[] = []

  if(method == Method.Apply) {
    for (const tx of block.body?.tx ?? []) {
      for (const txOutput of tx.outputs) {
        let txo = processTxOutput(txOutput, dex);
        if(txo) {
          txos.push(txo)
        }
      }

    }
  }
}

export function apply(blockJson: JsonValue, config: Record<string, string>) {
  return processBlock(blockJson, config, Method.Apply);
}

export function undo(blockJson: JsonValue, config: Record<string, string>) {
  return processBlock(blockJson, config, Method.Undo);
}
