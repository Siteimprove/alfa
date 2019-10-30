import { Element, getClosest, hasAttribute, Node } from "@siteimprove/alfa-dom";
import * as Roles from "../../roles";
import { Any, Feature, Role } from "../../types";

/**
 * @see https://www.w3.org/TR/svg-aam/#mapping_role_table
 */
export const A: Feature = {
  element: "a",
  role,
  allowedRoles: () => Any(Roles)
};

function role(input: Element, context: Node): Role | null {
  if (hasAttribute(input, context, "href")) {
    return Roles.Link;
  } else if (getClosest(input, context, "text") !== null) {
    return Roles.Group;
  } else {
    /**
     * @todo In certain rare circumstances the role will in this case be group. Investigate.
     */
    return null;
  }
}
