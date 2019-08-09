import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * NB: Though the specification defines separate logic for `<button>` with
 * `type="menu"`, this is currently an invalid button type according to the
 * HTML specification.
 *
 * @see https://www.w3.org/TR/html-aria/#button
 */
export const Button: Feature = {
  element: "button",
  role: () => Roles.Button,
  allowedRoles: () => [
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
