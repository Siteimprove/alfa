import { Role } from "../../types";
import { Section } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#status
 */
export const Status: Role = {
  name: "status",
  inherits: [Section],
  label: { from: ["author"] }
};
