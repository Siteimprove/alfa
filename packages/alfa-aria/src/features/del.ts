import * as Roles from "../roles";
import { Any, Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#ins-del
 */
export const Del: Feature = {
  element: "del",
  allowedRoles: () => Any(Roles)
};
