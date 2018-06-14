import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#tr
 */
export const TableRow: Feature = {
  element: "tr",
  role: Roles.Row,
  allowedRoles: Any(Roles)
};
