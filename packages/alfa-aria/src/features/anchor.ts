import { hasAttribute } from "@siteimprove/alfa-dom";
import { Any, Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#ahref
 * @see https://www.w3.org/TR/html-aria/#anohref
 */
export const A: Feature = {
  element: "a",
  role: anchor => (hasAttribute(anchor, "href") ? Roles.Link : undefined),
  allowedRoles: (anchor: any) =>
    hasAttribute(anchor, "href")
      ? [
          Roles.Button,
          Roles.Checkbox,
          Roles.MenuItem,
          Roles.MenuItemCheckbox,
          Roles.MenuItemRadio,
          Roles.Option,
          Roles.Radio,
          Roles.Switch,
          Roles.Tab,
          Roles.TreeItem
        ]
      : Any(Roles)
};
