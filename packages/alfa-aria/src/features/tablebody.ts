import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#tbody-tfoot-thead
 */
export const TableBody: Feature = {
  element: "tbody",
  role: Roles.RowGroup,
  allowedRoles: Any(Roles)
};
