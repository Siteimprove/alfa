import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/embedded.html#ImageElement
 */
export const Image: Feature = {
  element: "image",
  /**
   * @todo In certain rare circumstances the role will in this case be group. Investigate.
   */
  allowedRoles: () => Any(Roles)
};
