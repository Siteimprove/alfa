import { Element, getAttribute, Node } from "@siteimprove/alfa-dom";
import { Feature, Role, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#menuitem
 */
export const MenuItem: Feature = {
  element: "menuitem",
  role,
  allowedRoles: () => None,
  obsolete: true
};

function role(menuitem: Element, context: Node): Role | null {
  switch (getAttribute(menuitem, "type")) {
    case "command":
      return Roles.MenuItem;
    case "checkbox":
      return Roles.MenuItemCheckbox;
    case "radio":
      return Roles.MenuItemRadio;
  }

  return null;
}
