import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#output
 */
export const Output: Feature = {
  element: "output",
  role: Roles.Status,
  allowedRoles: Any(Roles)
};
