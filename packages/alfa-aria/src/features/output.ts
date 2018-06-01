import { Feature, AnyRole } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#output
 */
export const Output: Feature = {
  element: "output",
  allowedRoles: AnyRole
};
