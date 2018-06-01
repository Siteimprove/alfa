import { hasTextContent } from "@siteimprove/alfa-dom";
import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#form
 */
export const Form: Feature = {
  element: "form",
  role: form => (hasTextContent(form) === null ? Roles.Form : undefined),
  allowedRoles: [Roles.None, Roles.Presentation, Roles.Search]
};
