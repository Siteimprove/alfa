import { Role } from "../../types";
import { Row, RowGroup } from "../structure";
import { Grid, Tree } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#treegrid
 */
export const TreeGrid: Role = {
  name: "treegrid",
  label: { from: "author", required: true },
  inherits: [Grid, Tree],
  owned: [Row, [RowGroup, Row]]
};
