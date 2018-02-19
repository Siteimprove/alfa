import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Structure } from "../abstract";
import { Row, Table } from "../structure";
import { Grid, TreeGrid } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#rowgroup
 */
export const RowGroup: Role = {
  name: "rowgroup",
  label: { from: ["author", "contents"] },
  inherits: [Structure],
  context: [Grid, Table, TreeGrid],
  owned: [Row]
};
