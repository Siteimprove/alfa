import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#div
 */
export const Div: Feature = {
  element: "div",
  allowedRoles: () => Any(Roles)
};
