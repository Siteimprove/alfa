import { Feature, AnyRole } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#span
 */
export const Span: Feature = {
  element: "span",
  allowedRoles: AnyRole
};
