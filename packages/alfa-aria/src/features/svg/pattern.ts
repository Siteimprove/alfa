import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/pservers.html#PatternElement
 */
export const Pattern: Feature = {
  element: "pattern",
  allowedRoles: () => None(Roles)
};
