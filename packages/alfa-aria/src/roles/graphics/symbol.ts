import { Category, Role } from "../../types";
import { Img } from "../structure/img";

/**
 * @see https://www.w3.org/TR/graphics-aria/#graphics-symbol
 */
export const GraphicsSymbol: Role = {
  name: "graphics-symbol",
  category: Category.Graphics,
  inherits: () => [Img],
  label: { from: ["author"], required: true }
};
