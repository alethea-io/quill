import * as reducers from 'https://raw.githubusercontent.com/alethea-io/quill/main/dist/mod.js'

const config = [
  {
    name: "AddressState",
    config: {
      addressType: "payment",
      schema: "scrolls",
      table: "address_state",
    }
  },
  {
    name: "AddressState",
    config: {
      addressType: "stake",
      schema: "scrolls",
      table: "stake_address_state",
    }
  },
  // {
  //   name: "TokenState",
  //   config: {
  //     table: "token_state",
  //   }
  // },
]

export function apply(blockJson) {
  return reducers.SQL.apply(blockJson, config)
}

export function undo(blockJson) {
  return reducers.SQL.undo(blockJson, config)
}

// import blockJson from "./block.json" with { type: "json" }
// const results = apply(blockJson)
// console.log(JSON.stringify(results, null, 2))