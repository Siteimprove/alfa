import { Role } from "../../types";
import { Row } from "../structure/row";
import { RowGroup } from "../structure/row-group";
import { Grid } from "./grid";
import { Tree } from "./tree";

/**
 * @see https://www.w3.org/TR/wai-aria/#treegrid
 */
export const TreeGrid: Role = {
  name: "treegrid",
  inherits: [Grid, Tree],
  owned: [Row, [RowGroup, Row]],
  label: { from: ["author"], required: true }
};
