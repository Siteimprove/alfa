import { hasAttribute } from "@alfa/dom";
import { AnyRole, Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#ahref
 * @see https://www.w3.org/TR/html-aria/#anohref
 */
export const Anchor: Feature = {
  element: "a",
  role: anchor => (hasAttribute(anchor, "href") ? Roles.Link : undefined),
  allowedRoles: anchor =>
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
      : AnyRole
};
