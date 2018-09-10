import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { SectionHead } from "../abstract/section-head";
import { GridCell } from "../widgets/grid-cell";
import { Cell } from "./cell";
import { Row } from "./row";

/**
 * @see https://www.w3.org/TR/wai-aria/#columnheader
 */
export const ColumnHeader: Role = {
  name: "columnheader",
  category: Category.Structure,
  inherits: () => [Cell, GridCell, SectionHead],
  context: () => [Row],
  supported: () => [Attributes.Sort],
  label: { from: ["contents", "author"], required: true }
};
