import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#col-colgroup.
 */
export const ColGroup: Feature = {
  element: "colgroup",
  allowedRoles: () => None,
  allowedAttributes: () => None
};
