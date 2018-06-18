import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#text-level-semantics
 */
export const Br: Feature = {
  element: "br",
  allowedRoles: () => Any(Roles)
};
