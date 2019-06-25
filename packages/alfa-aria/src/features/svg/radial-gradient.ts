import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/pservers.html#RadialGradientElement
 */
export const RadialGradient: Feature = {
  element: "radialgradient",
  allowedRoles: () => None(Roles)
};
