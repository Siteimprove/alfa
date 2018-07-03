import * as Roles from "../roles";
import { Any, Feature } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#span
 */
export const Span: Feature = {
  element: "span",
  allowedRoles: () => Any(Roles)
};
