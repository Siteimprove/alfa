import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/2012/WD-filter-effects-20121025/#feFuncRElement
 */
export const FeFuncR: Feature = {
  element: "fefuncr",
  allowedRoles: () => None(Roles)
};
