import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#nav
 */
export const Nav: Feature = {
  element: "nav",
  role: () => Roles.Navigation,
  allowedRoles: () => None(Roles)
};
