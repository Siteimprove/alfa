import { Element, getAttribute, Node } from "@siteimprove/alfa-dom";
import { Feature, Role } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#h1-h6
 */
export const H4: Feature = {
  element: "h4",
  role,
  allowedRoles: [Roles.Tab, Roles.None, Roles.Presentation]
};

function role(h4: Element, context: Node): Role | undefined {
  const att = getAttribute(h4, "aria-level");
  if (att !== null && parseInt(att) > 0) {
    return Roles.Heading;
  }
  return undefined;
}
