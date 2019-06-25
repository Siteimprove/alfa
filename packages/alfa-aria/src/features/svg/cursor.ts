import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see http://www.w3.org/TR/SVG2/interact.html#CursorElement
 */
export const Cursor: Feature = {
  element: "cursor",
  allowedRoles: () => None(Roles)
};
