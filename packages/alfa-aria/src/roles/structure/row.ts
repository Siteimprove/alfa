import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Widget } from "../abstract/widget";
import { Grid } from "../widgets/grid";
import { GridCell } from "../widgets/grid-cell";
import { TreeGrid } from "../widgets/tree-grid";
import { Cell } from "./cell";
import { ColumnHeader } from "./column-header";
import { Group } from "./group";
import { RowGroup } from "./row-group";
import { RowHeader } from "./row-header";
import { Table } from "./table";

/**
 * @see https://www.w3.org/TR/wai-aria/#row
 */
export const Row: Role = {
  name: "row",
  category: Category.Structure,
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
