import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#abbr
 */
export const Abbr: Feature = {
  element: "abbr",
  allowedRoles: () => Any(Roles)
};
