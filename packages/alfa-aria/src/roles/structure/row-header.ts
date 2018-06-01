import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Cell, Row } from "../structure";
import { GridCell } from "../widgets";
import { SectionHead } from "../abstract";
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
