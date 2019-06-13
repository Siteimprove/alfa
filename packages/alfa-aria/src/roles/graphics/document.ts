import { Category, Role } from "../../types";
import { Document } from "../structure/document";

/**
 * @see https://www.w3.org/TR/graphics-aria/#graphics-document
 */
export const GraphicsDocument: Role = {
  name: "graphicsdocument",
  category: Category.Graphics,
  inherits: () => [Document],
  label: { from: ["author"], required: true }
};
