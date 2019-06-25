import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/shapes.html#RectElement
 */
export const Rect: Feature = {
  element: "rect",
  /**
   * @todo In certain rare circumstances the role will in this case be graphics-symbol. Investigate.
   */
  allowedRoles: () => Any(Roles)
};
