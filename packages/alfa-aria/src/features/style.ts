import * as Attributes from "../attributes";
import * as Roles from "../roles";
import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#style
 */
export const Style: Feature = {
  element: "style",
  allowedRoles: () => None(Roles),
  allowedAttributes: () => None(Attributes)
};
