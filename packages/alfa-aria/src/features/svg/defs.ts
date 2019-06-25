import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/struct.html#DefsElement
 */
export const Defs: Feature = {
  element: "defs",
  allowedRoles: () => None(Roles)
};
