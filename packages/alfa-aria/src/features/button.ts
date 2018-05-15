import { getAttribute } from "@siteimprove/alfa-dom";
import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#button
 * @see https://www.w3.org/TR/html-aria/#typemenu
 */
export const Button: Feature = {
  element: "button",
  role: Roles.Button,
  allowedRoles: button =>
    getAttribute(button, "type") === "menu"
      ? [Roles.MenuItem]
      : [
          Roles.Checkbox,
          Roles.Link,
          Roles.MenuItem,
          Roles.MenuItemCheckbox,
          Roles.MenuItemRadio,
          Roles.Option,
          Roles.Radio,
          Roles.Switch,
          Roles.Tab
        ]
};
