import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Widget } from "../abstract/widget";
import { Cell } from "../structure/cell";
import { Row } from "../structure/row";

/**
 * @see https://www.w3.org/TR/wai-aria/#gridcell
 */
export const GridCell: Role = {
  name: "gridcell",
  inherits: () => [Cell, Widget],
  context: () => [Row],
  supported: () => [
    Attributes.ReadOnly,
    Attributes.Required,
    Attributes.Selected
  ],
  label: { from: ["contents", "author"], required: true }
};
