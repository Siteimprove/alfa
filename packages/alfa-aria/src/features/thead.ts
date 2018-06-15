import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#thead
 */
export const Thead: Feature = {
  element: "thead",
  role: Roles.RowGroup,
  allowedRoles: Any(Roles)
};
