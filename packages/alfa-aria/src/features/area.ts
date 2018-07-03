import { hasAttribute } from "@siteimprove/alfa-dom";
import * as Roles from "../roles";
import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#areahref
 */
export const Area: Feature = {
  element: "area",
  role: area => (hasAttribute(area, "href") ? Roles.Link : null),
  allowedRoles: () => None
};
