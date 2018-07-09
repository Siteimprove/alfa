import {
  Element,
  getInputType,
  hasAttribute,
  Node
} from "@siteimprove/alfa-dom";
import * as Roles from "../roles";
import { Feature, None, Role } from "../types";

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
    case "button":
    case "image":
    case "reset":
    case "submit":
      return Roles.Button;
    case "checkbox":
      return Roles.Checkbox;
    case "number":
      return Roles.SpinButton;
    case "radio":
      return Roles.Radio;
    case "range":
      return Roles.Slider;
    case "search":
      if (!hasAttribute(input, "list")) {
        return Roles.SearchBox;
      }
      return Roles.Combobox;
    case "email":
    case "tel":
    case "text":
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
      return null;
  }
}

function allowedRoles(input: Element, context: Node): Array<Role> {
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
    case "text":
      if (!hasAttribute(input, "list")) {
        return [Roles.Combobox, Roles.SearchBox, Roles.SpinButton];
      }
      return None(Roles);
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
    case "time":
    case "url":
    case "week":
    case null:
    default:
      return None(Roles);
  }
}
