import * as Roles from "../roles";
import { Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#dl
 */
export const Dl: Feature = {
  element: "dl",
  role: () => Roles.List,
  allowedRoles: () => [Roles.Group, Roles.Presentation, Roles.None]
};
