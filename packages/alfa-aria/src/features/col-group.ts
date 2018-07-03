import * as Attributes from "../attributes";
import * as Roles from "../roles";
import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#col-colgroup.
 */
export const ColGroup: Feature = {
  element: "colgroup",
  allowedRoles: () => None(Roles),
  allowedAttributes: () => None(Attributes)
};
