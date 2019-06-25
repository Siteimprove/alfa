import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/struct.html#SVGElement
 */
export const Svg: Feature = {
  element: "svg",
  role: () => Roles.GraphicsDocument,
  allowedRoles: () => Any(Roles)
};
