import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#th
 */
export const Th: Feature = {
  element: "th",
  role: Roles.ColumnHeader || Roles.RowHeader,
  allowedRoles: Any
};
