import { blake2b } from "https://deno.land/x/blake2b@v0.1.0/mod.ts";
import { bech32 } from "npm:bech32";

const BYRON_UNIX = 1506203091;
const SHELLY_UNIX = 1596491091;
const SHELLY_SLOT = 4924800;

export function slotToTimestamp(slotNumber: number): string {
  let unixTimestamp;

  if (slotNumber <= SHELLY_SLOT) {
    unixTimestamp = BYRON_UNIX + slotNumber * 20;
  } else {
    unixTimestamp = SHELLY_UNIX + (slotNumber - SHELLY_SLOT);
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
