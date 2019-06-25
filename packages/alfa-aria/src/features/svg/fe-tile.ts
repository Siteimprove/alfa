import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/2012/WD-filter-effects-20121025/#fetile
 */
export const FeTile: Feature = {
  element: "fetile",
  allowedRoles: () => None(Roles)
};
