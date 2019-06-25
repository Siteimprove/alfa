import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/interact.html#ScriptElement
 */
export const Script: Feature = {
  element: "script",
  allowedRoles: () => None(Roles)
};
