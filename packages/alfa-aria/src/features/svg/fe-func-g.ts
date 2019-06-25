import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/2012/WD-filter-effects-20121025/#feFuncGElement
 */
export const FeFuncG: Feature = {
  element: "fefuncg",
  allowedRoles: () => None(Roles)
};
