import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/struct.html#SwitchElement
 */
export const Switch: Feature = {
  element: "switch",
  allowedRoles: () => None(Roles)
};
