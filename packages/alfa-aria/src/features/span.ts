import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#span
 */
export const Span: Feature = {
  element: "span",
  allowedRoles: () => Any(Roles)
};
