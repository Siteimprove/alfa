import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/pservers.html#HatchElement
 */
export const Hatch: Feature = {
  element: "hatch",
  allowedRoles: () => None(Roles)
};
