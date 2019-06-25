import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/2012/WD-filter-effects-20121025/#feImageElement
 */
export const FeImage: Feature = {
  element: "feimage",
  allowedRoles: () => None(Roles)
};
