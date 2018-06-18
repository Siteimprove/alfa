import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#ins-del
 */
export const Del: Feature = {
  element: "del",
  allowedRoles: () => Any(Roles)
};
