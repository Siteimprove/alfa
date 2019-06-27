import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#form
 */
export const Form: Feature = {
  element: "form",
  // The role of a form element CANNOT depend on whether or not it has an
  // accessible name; to determine the accessible name of an element, it's role
  // must be considered, therefore causing a recursive definition.
  role: () => Roles.Form,
  allowedRoles: () => [Roles.Search, Roles.None, Roles.Presentation]
};
