import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#dl
 */
export const Dl: Feature = {
  element: "dl",
  role: Roles.List,
  allowedRoles: [Roles.Group, Roles.Presentation, Roles.None]
};
