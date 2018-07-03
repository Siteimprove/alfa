import * as Roles from "../roles";
import { Any, Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#g
 */
export const Q: Feature = {
  element: "q",
  allowedRoles: () => Any(Roles)
};
