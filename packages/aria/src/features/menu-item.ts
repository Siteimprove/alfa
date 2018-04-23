import { getAttribute, isElement } from "@alfa/dom";
import { Feature, Role, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#menuitem
 */
export const MenuItem: Feature = {
  element: "menuitem",
  role,
  allowedRoles: None
};

function role(menuitem: Element, context: Element): Role | undefined {
  if (isElement(menuitem)) {
    switch (getAttribute(menuitem, "type")) {
      case "command":
        return Roles.MenuItem;
      case "checkbox":
        return Roles.MenuItemCheckbox;
      case "radio":
        return Roles.MenuItemRadio;
      default:
        return undefined;
    }
  }
  return undefined;
}
