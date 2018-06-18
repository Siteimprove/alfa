import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Widget } from "../abstract/widget";
import { Grid } from "../widgets/grid";
import { GridCell } from "../widgets/grid-cell";
import { TreeGrid } from "../widgets/tree-grid";
import { Group } from "./group";
import { RowGroup } from "./row-group";
import { Table } from "./table";
import { Cell } from "./cell";
import { ColumnHeader } from "./column-header";
import { RowHeader } from "./row-header";

/**
 * @see https://www.w3.org/TR/wai-aria/#row
 */
export const Row: Role = {
  name: "row",
  inherits: () => [Widget, Group],
  context: () => [Grid, RowGroup, Table, TreeGrid],
  owned: () => [Cell, ColumnHeader, GridCell, RowHeader],
  supported: () => [
    Attributes.ColumnIndex,
    Attributes.Level,
    Attributes.RowIndex,
    Attributes.Selected
  ],
  label: { from: ["contents", "author"] }
};
