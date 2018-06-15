import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#text-level-semantics
 */
export const Time: Feature = {
  element: "time",
  allowedRoles: Any(Roles)
};
