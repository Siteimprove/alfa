import * as Roles from "../../roles";
import { Feature, None } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#main
 */
export const Main: Feature = {
  element: "main",
  role: () => Roles.Main,
  allowedRoles: () => None(Roles)
};
