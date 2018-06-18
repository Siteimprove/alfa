import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { GridCell } from "../widgets/grid-cell";
import { SectionHead } from "../abstract/section-head";
import { Cell } from "./cell";
import { Row } from "./row";

/**
 * @see https://www.w3.org/TR/wai-aria/#rowheader
 */
export const RowHeader: Role = {
  name: "rowheader",
  inherits: [Cell, GridCell, SectionHead],
  context: [Row],
  supported: [Attributes.Sort],
  label: { from: ["contents", "author"], required: true }
};
