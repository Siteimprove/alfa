import { hasText } from "@alfa/dom";
import { Feature, None } from "../types";
import { getTextAlternative } from "../get-text-alternative";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#form
 */
export const Form: Feature = {
  element: "form",
  role: form => (hasText(form) === null ? Roles.Form : undefined),
  allowedRoles: [Roles.None, Roles.Presentation, Roles.Search]
};
