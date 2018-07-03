import * as Roles from "../roles";
import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#details
 */
export const Details: Feature = {
  element: "details",
  role: () => Roles.Group,
  allowedRoles: () => None
};
