import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/2012/WD-filter-effects-20121025/#fespecularlighting
 */
export const FeSpecularLighting: Feature = {
  element: "fespecularlighting",
  allowedRoles: () => None(Roles)
};
