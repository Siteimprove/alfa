import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/pservers.html#SolidcolorElement
 */
export const SolidColor: Feature = {
  element: "solidcolor",
  allowedRoles: () => None(Roles)
};
