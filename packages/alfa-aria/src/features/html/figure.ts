import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#figure
 */
export const Figure: Feature = {
  element: "figure",
  role: () => Roles.Figure,
  allowedRoles: () => [Roles.Group, Roles.None, Roles.Presentation]
};
