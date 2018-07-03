import { hasTextAlternative } from "../has-text-alternative";
import * as Roles from "../roles";
import { Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#form
 */
export const Form: Feature = {
  element: "form",
  role: (form, context) =>
    hasTextAlternative(form, context) ? Roles.Form : null,
  allowedRoles: () => [Roles.Search, Roles.None, Roles.Presentation]
};
