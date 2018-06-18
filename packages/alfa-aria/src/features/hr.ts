import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#hr
 */
export const Hr: Feature = {
  element: "hr",
  role: () => Roles.Separator,
  allowedRoles: () => [Roles.None, Roles.Presentation]
};
