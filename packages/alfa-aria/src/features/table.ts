import { Feature, AnyRole } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#table
 */
export const Table: Feature = {
  element: "table",
  role: Roles.Table,
  allowedRoles: AnyRole
};
