import { Role } from "../../types";
import { Landmark } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#navigation
 */
export const Navigation: Role = {
  name: "navigation",
  inherits: [Landmark],
  label: { from: ["author"] }
};
