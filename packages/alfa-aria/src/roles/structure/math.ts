import { Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#math
 */
export const Math: Role = {
  name: "math",
  inherits: [Section],
  label: { from: ["author"] }
};
