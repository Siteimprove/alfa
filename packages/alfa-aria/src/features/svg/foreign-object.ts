import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/embedded.html#ForeignObjectElement
 */
export const ForeignObject: Feature = {
  element: "foreignobject",
  /**
   * @todo In certain rare circumstances the role will in this case be group. Investigate.
   */
  allowedRoles: () => Any(Roles)
};
