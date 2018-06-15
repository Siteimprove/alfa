import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#div
 */
export const Div: Feature = {
  element: "div",
  allowedRoles: Any(Roles)
};
