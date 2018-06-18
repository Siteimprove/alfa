import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#script
 */
export const Script: Feature = {
  element: "script",
  allowedRoles: () => None,
  allowedAttributes: () => None
};
