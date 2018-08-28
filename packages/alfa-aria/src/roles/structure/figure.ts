import { Category, Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#figure
 */
export const Figure: Role = {
  name: "figure",
  category: Category.Structure,
  inherits: () => [Section],
  label: { from: ["author"] }
};
