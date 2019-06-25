import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/styling.html#StyleElement
 */
export const Style: Feature = {
  element: "style",
  allowedRoles: () => None(Roles)
};
