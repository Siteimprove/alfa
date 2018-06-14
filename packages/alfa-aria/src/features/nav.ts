import { Feature, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#nav
 */
export const Nav: Feature = {
  element: "nav",
  role: Roles.Navigation,
  allowedRoles: None //Only DPub roles are allowed. Thus, only the implicit ARIA role is allowed.
};
