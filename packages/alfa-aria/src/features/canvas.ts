import { Feature, AnyRole } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#canvas
 */
export const Canvas: Feature = {
  element: "canvas",
  allowedRoles: AnyRole
};
