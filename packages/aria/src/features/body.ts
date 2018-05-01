import { Feature, NoAttribute, NoRole } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#body
 */
export const Body: Feature = {
  element: "body",
  allowedRoles: NoRole,
  allowedAttributes: NoAttribute
};
