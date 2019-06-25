import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/2012/WD-css-masking-20121115/#ClipPathElement
 */
export const ClipPath: Feature = {
  element: "clippath",
  allowedRoles: () => None(Roles)
};
