import * as reducers from "file:///home/aleksandar/Projects/alethea/alethea-data/quill/dist/mod.js"

const config = [
  {
    name: "AddressState",
    config: {
      addressType: "payment",
    }
  },
  {
    name: "AddressState",
    config: {
      addressType: "stake",
    }
  },
  {
    name: "TokenState",
    config: {}
  },
  {
    name: "AddressTokenState",
    config: {
      addressType: "payment",
    }
  },
  {
    name: "AddressTokenState",
    config: {
      addressType: "stake",
    }
  },
]

export function reduce(blockJson) {
  return reducers.SQL.apply(blockJson, config)
}

// export function undo(blockJson) {
//   return reducers.SQL.undo(blockJson, config)
// }

// import blockJson from "./block.json" with { type: "json" }
// const results = apply(blockJson)
// console.log(JSON.stringify(results, null, 2))