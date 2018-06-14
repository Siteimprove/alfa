import { Any, Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#abbr
 */
export const Abbr: Feature = {
  element: "abbr",
  allowedRoles: Any(Roles)
};
