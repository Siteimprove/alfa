import { Feature, None } from "../types";
import * as Roles from "../roles";
/**
 * @see https://www.w3.org/TR/html-aria/#details
 */
export const Details: Feature = {
  element: "details",
  role: Roles.Group,
  allowedRoles: None
};
