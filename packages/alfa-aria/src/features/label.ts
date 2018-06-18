import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#label
 */
export const Label: Feature = {
  element: "label",
  allowedRoles: () => None
};
