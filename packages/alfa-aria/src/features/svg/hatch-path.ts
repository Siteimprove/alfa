import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/pservers.html#HatchpathElement
 */
export const HatchPath: Feature = {
  element: "hatchpath",
  allowedRoles: () => None(Roles)
};
