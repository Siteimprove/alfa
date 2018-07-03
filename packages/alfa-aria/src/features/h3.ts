import * as Roles from "../roles";
import { Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#h1-h6
 */
export const H3: Feature = {
  element: "h3",
  role: () => Roles.Heading,
  allowedRoles: () => [Roles.Tab, Roles.None, Roles.Presentation]
};
