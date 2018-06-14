import {
  Element,
  getInputType,
  hasAttribute,
  Node
} from "@siteimprove/alfa-dom";
import { Feature, Role, None } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#input
 */
export const Input: Feature = {
  element: "input",
  role,
  allowedRoles
};

function role(input: Element, context: Node): Role | undefined {
  switch (getInputType(input)) {
    case "button":
      return Roles.Button;
    case "checkbox":
      return Roles.Checkbox;
    case "email":
      if (!hasAttribute(input, "list")) {
        return Roles.TextBox;
      }
      return Roles.Combobox;
    case "image":
      return Roles.Button;
    case "number":
      return Roles.SpinButton;
    case "radio":
      return Roles.Radio;
    case "range":
      return Roles.Slider;
    case "reset":
      return Roles.Button;
    case "search":
      if (!hasAttribute(input, "list")) {
        return Roles.SearchBox;
      }
      return Roles.Combobox;
    case "submit":
      return Roles.Button;
    case "tel":
      if (!hasAttribute(input, "list")) {
        return Roles.TextBox;
      }
      return Roles.Combobox;
    case "text":
      if (!hasAttribute(input, "list")) {
        return Roles.TextBox;
      }
      return Roles.Combobox;
    case "url":
      if (!hasAttribute(input, "list")) {
        return Roles.TextBox;
      }
      return Roles.Combobox;
    case "color":
    case "date":
    case "datetime-local":
    case "file":
    case "hidden":
    case "month":
    case "password":
    case "time":
    case "week":
    case null:
    default:
      return undefined;
  }
}

function allowedRoles(
  input: Element,
  context: Node
): Array<Role> | typeof None {
  switch (getInputType(input)) {
    case "button":
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
    case "checkbox":
      if (hasAttribute(input, "aria-pressed")) {
        return [
          Roles.Button,
          Roles.MenuItemCheckbox,
          Roles.Option,
          Roles.Switch
        ];
      }
      return [Roles.MenuItemCheckbox, Roles.Option, Roles.Switch];
    case "image":
      return [
        Roles.Link,
        Roles.MenuItem,
        Roles.MenuItemCheckbox,
        Roles.MenuItemRadio,
        Roles.Radio,
        Roles.Switch
      ];
    case "radio":
      return [Roles.MenuItemRadio];
    case "color":
    case "date":
    case "datetime-local":
    case "email":
    case "file":
    case "hidden":
    case "month":
    case "number":
    case "password":
    case "range":
    case "reset":
    case "search":
    case "submit":
    case "tel":
    case "text":
    case "time":
    case "url":
    case "week":
    case null:
    default:
      return None;
  }
}
