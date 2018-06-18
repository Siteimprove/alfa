import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#source
 */
export const Source: Feature = {
  element: "source",
  allowedRoles: () => None,
  allowedAttributes: () => None
};
