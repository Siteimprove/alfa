import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#meta
 */
export const Meta: Feature = {
  element: "meta",
  allowedRoles: () => None
};
