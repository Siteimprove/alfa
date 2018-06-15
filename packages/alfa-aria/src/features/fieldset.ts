import { Feature } from "../types";
import * as Roles from "../roles";
/**
 * @see https://www.w3.org/TR/html-aria/#fieldset
 */
export const Fieldset: Feature = {
  element: "fieldset",
  allowedRoles: [Roles.Group, Roles.None, Roles.Presentation]
};
