import type { JsonValue } from "npm:@bufbuild/protobuf";

export function apply(blockJson: JsonValue, config: Record<string, string>) {
  const blockJsonStr = JSON.stringify(blockJson);
  return {
    command: "ExecuteSQL",
    sql: `SELECT insert_block('${blockJsonStr}'::json);`,
  };
}

export function undo(blockJson: JsonValue, config: Record<string, string>) {
  const blockJsonStr = JSON.stringify(blockJson);
  const blockHash = JSON.parse(blockJsonStr).header.hash;
  return {
    command: "ExecuteSQL",
    sql: `DELETE FROM block WHERE hash = '${blockHash}';`
  }
}
