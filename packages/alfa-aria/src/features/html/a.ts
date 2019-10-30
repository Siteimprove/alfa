import { hasAttribute } from "@siteimprove/alfa-dom";
import * as Roles from "../../roles";
import { Any, Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#ahref
 * @see https://www.w3.org/TR/html-aria/#anohref
 */
export const A: Feature = {
  element: "a",
  role: (anchor, context) =>
    hasAttribute(anchor, context, "href") ? Roles.Link : null,
  allowedRoles: (anchor, context) =>
    hasAttribute(anchor, context, "href")
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
