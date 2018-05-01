import { Feature, AnyRole, AnyAttribute } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#abbr
 */
export const Abbr: Feature = {
  element: "abbr",
  allowedRoles: AnyRole,
  allowedAttributes: AnyAttribute
};
