import type { JsonValue } from "npm:@bufbuild/protobuf";

import * as BalanceByAddress from "./reducers/crdt/balance_by_address.ts";

import * as AddressState from "./reducers/sql/address_state/address_state.ts";
import * as AddressTokenState from "./reducers/sql/address_token_state/address_token_state.ts";
import * as TokenState from "./reducers/sql/token_state/token_state.ts";

type Reducer = {
  name: string;
  config: Record<string, string>;
};

interface Module {
  apply: (blockJson: JsonValue, config: Record<string, string>) => any;
  undo: (blockJson: JsonValue, config: Record<string, string>) => any;
}

class CRDT {
  private static modules: Record<string, Module> = {
    "BalanceByAddress": BalanceByAddress,
  };

  static apply(blockJson: JsonValue, reducers: Reducer[]) {
    return reducers.flatMap(({ name, config }) => {
      const module = CRDT.modules[name];
      if (module) {
        return module.apply(blockJson, config);
      }
      throw new Error(`CRDT module with name ${name} does not exist.`);
    });
  }

  static undo(blockJson: JsonValue, reducers: Reducer[]) {
    return reducers.flatMap(({ name, config }) => {
      const module = CRDT.modules[name];
      if (module) {
        return module.undo(blockJson, config);
      }
      throw new Error(`CRDT module with name ${name} does not exist.`);
    });
  }
}

class SQL {
  private static modules: Record<string, Module> = {
    "AddressState": AddressState,
    "AddressTokenState": AddressTokenState,
    "TokenState": TokenState,
  };

  static apply(blockJson: JsonValue, reducers: Reducer[]) {
    return reducers.flatMap(({ name, config }) => {
      const module = SQL.modules[name];
      if (module) {
        return module.apply(blockJson, config);
      }
      throw new Error(`SQL module with name ${name} does not exist.`);
    });
  }

  static undo(blockJson: JsonValue, reducers: Reducer[]) {
    return reducers.flatMap(({ name, config }) => {
      const module = SQL.modules[name];
      if (module) {
        return module.undo(blockJson, config);
      }
      throw new Error(`SQL module with name ${name} does not exist.`);
    });
  }
}

export { CRDT, SQL };
