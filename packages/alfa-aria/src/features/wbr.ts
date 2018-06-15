import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#text-level-semantics
 */
export const Wbr: Feature = {
  element: "wbr",
  allowedRoles: Any(Roles)
};
