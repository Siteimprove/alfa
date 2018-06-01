import { hasAttribute } from "@alfa/dom";
import { NoRole, Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#areahref
 */
export const Area: Feature = {
  element: "area",
  role: area => (hasAttribute(area, "href") ? Roles.Link : undefined),
  allowedRoles: NoRole
};
