import { Element, getAttribute, Node } from "@siteimprove/alfa-dom";
import { Feature, Role } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#h1-h6
 */
export const H1: Feature = {
  element: "h1",
  role,
  allowedRoles: [Roles.Tab, Roles.None, Roles.Presentation]
};

function role(h1: Element, context: Node): Role | undefined {
  const att = getAttribute(h1, "aria-level");
  if (att !== null && parseInt(att) > 0) {
    return Roles.Heading;
  }
  return undefined;
}
