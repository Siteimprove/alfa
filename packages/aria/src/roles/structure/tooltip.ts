import { Role } from "../../types";
import { Section } from "../abstract";
/**
 * @see https://www.w3.org/TR/wai-aria/#tooltip
 */
export const Tooltip: Role = {
  name: "tooltip",
  inherits: [Section],
  label: { from: ["author", "contents"], required: true }
};
