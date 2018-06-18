import { Role } from "../../types";
import { Structure } from "../abstract/structure";
import { Grid } from "../widgets/grid";
import { TreeGrid } from "../widgets/tree-grid";
import { Row } from "./row";
import { Table } from "./table";

/**
 * @see https://www.w3.org/TR/wai-aria/#rowgroup
 */
export const RowGroup: Role = {
  name: "rowgroup",
  inherits: () => [Structure],
  context: () => [Grid, Table, TreeGrid],
  owned: () => [Row],
  label: { from: ["contents", "author"] }
};
