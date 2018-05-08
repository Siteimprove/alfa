import { Feature, NoRole } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#nav
 */
export const Nav: Feature = {
  element: "nav",
  role: Roles.Navigation,
  allowedRoles: NoRole //The documentation does not specifically state this
};
