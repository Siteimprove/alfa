import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/struct.html#SymbolElement
 */
export const Switch: Feature = {
  element: "switch",
  /**
   * @todo In certain rare circumstances the role will in this case be graphics-object. Investigate.
   */
  allowedRoles: () => Any(Roles)
};
