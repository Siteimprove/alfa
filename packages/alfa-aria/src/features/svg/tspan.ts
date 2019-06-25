import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/text.html#TextElement
 */
export const Tspan: Feature = {
  element: "tspan",
  /**
   * @todo In certain rare circumstances the role will in this case be group. Investigate.
   * @bug There is an open issue regarding the role mapping for tspan
   */
  allowedRoles: () => Any(Roles)
};
