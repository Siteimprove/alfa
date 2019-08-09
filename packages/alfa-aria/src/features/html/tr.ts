import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#tr
 */
export const Tr: Feature = {
  element: "tr",
  role: () => Roles.Row,
  allowedRoles: () => Any(Roles)
};
