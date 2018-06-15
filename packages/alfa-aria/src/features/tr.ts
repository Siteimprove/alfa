import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#tr
 */
export const Tr: Feature = {
  element: "tr",
  role: Roles.Row,
  allowedRoles: Any(Roles)
};
