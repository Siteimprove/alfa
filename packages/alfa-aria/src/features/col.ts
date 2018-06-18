import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#col-colgroup.
 */
export const Col: Feature = {
  element: "col",
  allowedRoles: () => None
};
