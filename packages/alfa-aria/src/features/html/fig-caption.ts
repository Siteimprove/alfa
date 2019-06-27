import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#figcaption
 */
export const FigCaption: Feature = {
  element: "figcaption",
  allowedRoles: () => [Roles.Group, Roles.Presentation, Roles.None]
};
