import { blake2b } from "https://deno.land/x/blake2b@v0.1.0/mod.ts";
import { bech32 } from "npm:bech32";

const BYRON_UNIX = 1506203091;
const BYRON_SLOT = 0;
const BYRON_SLOT_LEN = 20;
const SHELLEY_UNIX = 1596059091;
const SHELLEY_SLOT = 4492800;
const SHELLEY_SLOT_LEN = 1;

function compute_linear_timestamp(
  known_slot: number,
  known_time: number,
  slot_length: number,
  query_slot: number,
): number {
  return known_time + (query_slot - known_slot) * slot_length;
}

export function slotToTimestamp(slotNumber: number): string {
  let unixTimestamp;

  if (slotNumber < SHELLEY_SLOT) {
    unixTimestamp = compute_linear_timestamp(
      BYRON_SLOT,
      BYRON_UNIX,
      BYRON_SLOT_LEN,
      slotNumber,
    );
  } else {
    unixTimestamp = compute_linear_timestamp(
      SHELLEY_SLOT,
      SHELLEY_UNIX,
      SHELLEY_SLOT_LEN,
      slotNumber,
    );
  }

  const date = new Date(unixTimestamp * 1000);

  return date.toISOString();
}

export function assetFingerprint(policy: Uint8Array, name: Uint8Array): string {
  const hash = blake2b(
    new Uint8Array([...policy, ...name]),
    undefined,
    undefined,
    20,
  ) as Uint8Array;
  const words = bech32.toWords(hash);
  return bech32.encode("asset", words);
}
