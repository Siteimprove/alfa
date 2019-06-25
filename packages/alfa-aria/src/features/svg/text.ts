import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/text.html#TextElement
 */
export const Text: Feature = {
  element: "text",
  role: () => Roles.Group,
  allowedRoles: () => Any(Roles)
};
