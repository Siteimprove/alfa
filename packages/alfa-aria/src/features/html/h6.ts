import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#h1-h6
 */
export const H6: Feature = {
  element: "h6",
  role: () => Roles.Heading,
  allowedRoles: () => [Roles.Tab, Roles.None, Roles.Presentation]
};
