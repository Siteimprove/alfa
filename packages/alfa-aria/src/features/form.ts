import { hasTextAlternative } from "../has-text-alternative";
import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#form
 */
export const Form: Feature = {
  element: "form",
  role: (form, context) =>
    hasTextAlternative(form, context) ? Roles.Form : undefined,
  allowedRoles: [Roles.Search, Roles.None, Roles.Presentation]
};
