import { Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#note
 */
export const Note: Role = {
  name: "note",
  inherits: [Section],
  label: { from: ["author"] }
};
