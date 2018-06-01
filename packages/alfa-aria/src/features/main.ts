import { Feature, NoRole } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#main
 */
export const Main: Feature = {
  element: "main",
  role: Roles.Main,
  allowedRoles: NoRole
};
