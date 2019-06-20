import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#output
 */
export const Output: Feature = {
  element: "output",
  role: () => Roles.Status,
  allowedRoles: () => Any(Roles)
};
