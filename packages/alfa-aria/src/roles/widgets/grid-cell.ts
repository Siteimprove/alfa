import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Widget } from "../abstract/widget";
import { Cell } from "../structure/cell";
import { Row } from "../structure/row";

/**
 * @see https://www.w3.org/TR/wai-aria/#gridcell
 */
export const GridCell: Role = {
  name: "gridcell",
  category: Category.Widget,
  inherits: () => [Cell, Widget],
  context: () => [Row],
  supported: () => [
    Attributes.ReadOnly,
    Attributes.Required,
    Attributes.Selected
  ],
  label: { from: ["contents", "author"], required: true }
};
