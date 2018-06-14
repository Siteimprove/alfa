import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#text-level-semantics
 */
export const I: Feature = {
  element: "i",
  allowedRoles: Any(Roles)
};
