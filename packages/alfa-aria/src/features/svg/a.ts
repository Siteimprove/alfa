import { hasAttribute } from "@siteimprove/alfa-dom";
import * as Roles from "../../roles";
import { Any, Feature, Role } from "../../types";

/**
 * @see https://ww
 */
export const A: Feature = {
  element: "a",
  role,
  allowedRoles: () => Any(Roles)
};

function role(input: Element, context: Node): Role | null {
  if (hasAttribute(input, "href")) {
    return Roles.Link;
  }
  return null;
}
