import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/struct.html#GElement
 */
export const G: Feature = {
  element: "g",
  /**
   * @todo In certain rare circumstances the role will in this case be group. Investigate.
   */
  allowedRoles: () => Any(Roles)
};
