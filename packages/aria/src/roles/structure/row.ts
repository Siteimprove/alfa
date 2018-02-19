import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Widget } from "../abstract";
import { Group, RowGroup, Table, Cell } from "../structure";
import { Grid, TreeGrid } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#row
 */
export const Row: Role = {
  name: "row",
  label: { from: ["author", "contents"] },
  inherits: [Widget, Group],
  context: [Grid, RowGroup, Table, TreeGrid],
  owned: [Cell/*, ColumnHeader, GridCell, RowHeader*/],
  supported: [
    Attributes.ColumnIndex,
    Attributes.Level,
    Attributes.RowIndex,
    Attributes.Selected
  ]
};
