import { Feature, AnyRole } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#strong
 */
export const Strong: Feature = {
  element: "strong",
  allowedRoles: AnyRole
};
