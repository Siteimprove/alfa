import {
  Element,
  getInputType,
  hasAttribute,
  InputType,
  Node
} from "@siteimprove/alfa-dom";
import * as Roles from "../../roles";
import { Feature, None, Role } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#input
 */
export const Input: Feature = {
  element: "input",
  role,
  allowedRoles
};

function role(input: Element, context: Node): Role | null {
  switch (getInputType(input)) {
    case InputType.Button:
    case InputType.Image:
    case InputType.Reset:
    case InputType.Submit:
      return Roles.Button;

    case InputType.Checkbox:
      return Roles.Checkbox;

    case InputType.Number:
      return Roles.SpinButton;

    case InputType.Radio:
      return Roles.Radio;

    case InputType.Range:
      return Roles.Slider;

    case InputType.Search:
      if (!hasAttribute(input, "list")) {
        return Roles.SearchBox;
      }
      return Roles.Combobox;

    case InputType.Email:
    case InputType.Tel:
    case InputType.Text:
    case InputType.Url:
      if (!hasAttribute(input, "list")) {
        return Roles.TextBox;
      }
      return Roles.Combobox;

    default:
      return null;
  }
}

function allowedRoles(input: Element, context: Node): Array<Role> {
  switch (getInputType(input)) {
    case InputType.Button:
      return [
        Roles.Link,
        Roles.MenuItem,
        Roles.MenuItemCheckbox,
        Roles.MenuItemRadio,
        Roles.Option,
        Roles.Radio,
        Roles.Switch,
        Roles.Tab
      ];

    case InputType.Checkbox:
      if (hasAttribute(input, "aria-pressed")) {
        return [
          Roles.Button,
          Roles.MenuItemCheckbox,
          Roles.Option,
          Roles.Switch
        ];
      }
      return [Roles.MenuItemCheckbox, Roles.Option, Roles.Switch];

    case InputType.Image:
      return [
        Roles.Link,
        Roles.MenuItem,
        Roles.MenuItemCheckbox,
        Roles.MenuItemRadio,
        Roles.Radio,
        Roles.Switch
      ];

    case InputType.Radio:
      return [Roles.MenuItemRadio];

    case InputType.Text:
      if (!hasAttribute(input, "list")) {
        return [Roles.Combobox, Roles.SearchBox, Roles.SpinButton];
      }
  }

  return None(Roles);
}
