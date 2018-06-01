import { Role } from "../../types";
import { Structure } from "../abstract";
import { Row, Table } from "../structure";
import { Grid, TreeGrid } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#rowgroup
 */
export const RowGroup: Role = {
  name: "rowgroup",
  inherits: [Structure],
  context: [Grid, Table, TreeGrid],
  owned: [Row],
  label: { from: ["contents", "author"] }
};
