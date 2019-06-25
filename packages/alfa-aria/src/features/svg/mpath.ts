import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://svgwg.org/specs/animations/#MPathElement
 */
export const Mpath: Feature = {
  element: "mpath",
  allowedRoles: () => None(Roles)
};
