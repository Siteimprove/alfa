import { Category, Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#tooltip
 */
export const Tooltip: Role = {
  name: "tooltip",
  category: Category.Structure,
  inherits: () => [Section],
  label: { from: ["contents", "author"], required: true }
};
