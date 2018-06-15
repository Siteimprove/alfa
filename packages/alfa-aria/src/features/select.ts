import { Element, getAttribute, Node } from "@siteimprove/alfa-dom";
import { Feature, Role, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#select
 */
export const Select: Feature = {
  element: "select",
  role,
  allowedRoles: role === Roles.Combobox ? [Roles.Menu] : None
};

function role(select: Element, context: Node): Role | undefined {
  const attMult = getAttribute(select, "mulitple");
  const attSize = getAttribute(select, "size");
  if (attMult === null && attSize !== null && parseInt(attSize) <= 1) {
    return Roles.Combobox;
  } else return Roles.ListBox;
}
