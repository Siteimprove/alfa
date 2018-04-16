import { Role } from "../../types";
import { Section } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#figure
 */
export const Figure: Role = {
  name: "figure",
  inherits: [Section],
  label: { from: ["author"], required: false }
};
