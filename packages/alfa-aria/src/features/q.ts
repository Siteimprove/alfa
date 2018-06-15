import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#g
 */
export const Q: Feature = {
  element: "q",
  allowedRoles: Any(Roles)
};
