import { hasAttribute } from "@siteimprove/alfa-dom";
import { None, Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#areahref
 */
export const Area: Feature = {
  element: "area",
  role: area => (hasAttribute(area, "href") ? Roles.Link : undefined),
  allowedRoles: None
};
