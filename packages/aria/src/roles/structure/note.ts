import { Role } from "../../types";
import { Section } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#note
 */
export const Note: Role = {
  name: "Note",
  inherits: [Section],
  label: { from: ["author"] }
};
