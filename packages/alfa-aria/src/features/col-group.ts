import { Feature, NoRole } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#colgroup
 */
export const ColGroup: Feature = {
  element: "colgroup",
  allowedRoles: NoRole
};
