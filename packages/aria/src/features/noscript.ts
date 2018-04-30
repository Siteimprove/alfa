import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#noscript
 */
export const NoScript: Feature = {
  element: "noscript",
  allowedRoles: None
};
