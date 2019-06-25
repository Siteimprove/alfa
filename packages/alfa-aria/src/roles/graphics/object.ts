import { Category, Role } from "../../types";
import { Group } from "../structure/group";

/**
 * @see https://www.w3.org/TR/graphics-aria/#graphics-object
 */
export const GraphicsObject: Role = {
  name: "graphics-object",
  category: Category.Graphics,
  inherits: () => [Group],
  label: { from: ["author", "contents"] }
};
