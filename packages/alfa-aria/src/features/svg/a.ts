import { Element, getClosest, hasAttribute, Node } from "@siteimprove/alfa-dom";
import * as Roles from "../../roles";
import { Any, Feature, Role } from "../../types";

/**
 * @see https://www.w3.org/TR/SVG2/linking.html#AElement
 */
export const A: Feature = {
  element: "a",
  role,
  allowedRoles: () => Any(Roles)
};

function role(input: Element, context: Node): Role | null {
  if (hasAttribute(input, "href")) {
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
