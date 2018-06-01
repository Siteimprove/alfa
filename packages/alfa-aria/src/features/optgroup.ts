import { Feature, NoRole } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#optgroup
 */
export const Optgroup: Feature = {
  element: "optgroup",
  role: Roles.Group,
  allowedRoles: NoRole
};
