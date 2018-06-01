import { Role } from "../../types";
import { Section } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#alert
 */
export const Alert: Role = {
  name: "alert",
  inherits: [Section],
  label: { from: ["author"] }
};
