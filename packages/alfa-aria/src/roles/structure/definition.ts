import { Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#definition
 */
export const Definition: Role = {
  name: "definition",
  inherits: [Section],
  label: { from: ["author"] }
};
