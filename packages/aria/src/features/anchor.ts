import { getAttribute } from "@alfa/dom";
import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#ahref
 * @see https://www.w3.org/TR/html-aria/#anohref
 */
export const Anchor: Feature = {
  element: "a",
  role: anchor => (getAttribute(anchor, "href") === null ? null : Roles.Link),
  allowedRoles: anchor =>
    getAttribute(anchor, "href") === null
      ? []
      : [
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
};
