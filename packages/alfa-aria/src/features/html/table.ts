import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#table
 */
export const Table: Feature = {
  element: "table",
  role: () => Roles.Table,
  allowedRoles: () => Any(Roles)
};
