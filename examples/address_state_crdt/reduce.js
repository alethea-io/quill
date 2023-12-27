import * as reducers from "file:///home/aleksandar/Projects/quill/dist/mod.js"

const config = [
  {
    name: "BalanceByAddress",
    config: {
      addressType: "payment",
      prefix: "balance_by_address",
    }
  },
  {
    name: "BalanceByAddress",
    config: {
      addressType: "stake",
      prefix: "balance_by_stake_address",
    }
  },
]

export function reduce(blockJson) {
  return reducers.CRDT.apply(blockJson, config)
}