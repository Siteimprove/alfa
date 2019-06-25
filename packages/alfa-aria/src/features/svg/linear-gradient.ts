import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/pservers.html#LinearGradientElement
 */
export const LinearGradient: Feature = {
  element: "lineargradient",
  allowedRoles: () => None(Roles)
};
