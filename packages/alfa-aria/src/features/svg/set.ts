import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://svgwg.org/specs/animations/#SetElement
 */
export const Set: Feature = {
  element: "set",
  allowedRoles: () => None(Roles)
};
