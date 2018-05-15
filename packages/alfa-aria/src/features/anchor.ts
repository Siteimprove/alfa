import { getAttribute } from "@siteimprove/alfa-dom";
import { Feature, Any } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#ahref
 * @see https://www.w3.org/TR/html-aria/#anohref
 */
export const Anchor: Feature = {
  element: "a",
  role: anchor =>
    getAttribute(anchor, "href") === null ? undefined : Roles.Link,
  allowedRoles: anchor =>
    getAttribute(anchor, "href") === null
      ? Any
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
