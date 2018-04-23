import { getParent, getTag, isElement } from "@alfa/dom";
import { Feature, Role } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#li
 */
export const Li: Feature = {
  element: "li",
  role,
  allowedRoles: [
    Roles.MenuItem,
    Roles.MenuItemCheckbox,
    Roles.MenuItemRadio,
    Roles.Option,
    Roles.None,
    Roles.Presentation,
    Roles.Radio,
    //Roles.Separator,
    Roles.Tab,
    Roles.TreeItem
  ]
};

function role(il: Element, context: Element): Role | undefined {
  const parent = getParent(il, context);
  if (parent != null && isElement(parent)) {
    switch (getTag(parent)) {
      case "ol":
        return Roles.ListItem;
      case "ul":
        return Roles.ListItem;
      default:
        return undefined;
    }
  }
  return undefined;
}
