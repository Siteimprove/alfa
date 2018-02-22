import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Widget } from "../abstract";
import { Cell, Row } from "../structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#gridcell
 */
export const GridCell: Role = {
  name: "gridcell",
  label: { from: ["author", "contents"], required: true },
  inherits: [Cell, Widget],
  context: [Row],
  supported: [Attributes.ReadOnly, Attributes.Required, Attributes.Selected]
};
