import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/pservers.html#StopElement
 */
export const Stop: Feature = {
  element: "stop",
  allowedRoles: () => None(Roles)
};
