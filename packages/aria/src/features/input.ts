import { Element, getAttribute, hasAttribute } from "@alfa/dom";
import { Feature, Role, NoRole } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#input
 */
export const Input: Feature = {
  element: "input",
  role,
  allowedRoles
};
//TODO Verify with Kasper that this is indeed correct
function role(input: Element, context: Element): Role | undefined {
  if (hasAttribute(input, "type")) {
    switch (getAttribute(input, "type")) {
      case "button":
        return Roles.Button;
      case "checkbox":
        return Roles.Checkbox;
      case "color":
        return undefined;
      case "date":
        return undefined;
      case "datetime":
        return undefined;
      case "email":
        if (!hasAttribute(input, "list")) {
          return Roles.TextBox;
        }
        return Roles.Combobox;
      case "file":
        return undefined;
      case "hidden":
        return undefined;
      case "image":
        return Roles.Button;
      case "month":
        return undefined;
      case "number":
        return Roles.SpinButton;
      case "password":
        return undefined;
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
      case "time":
        return undefined;
      case "url":
        if (!hasAttribute(input, "list")) {
          return Roles.TextBox;
        }
        return Roles.Combobox;
      case "week":
        return undefined;
      default:
        return undefined;
    }
  }
  return undefined;
}

function allowedRoles(
  input: Element,
  context: Node
): Array<Role> | typeof NoRole {
  if (hasAttribute(input, "type")) {
    switch (getAttribute(input, "type")) {
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
        if (hasAttribute(input, "pressed")) {
          return [
            Roles.Button,
            Roles.MenuItemCheckbox,
            Roles.Option,
            Roles.Switch
          ];
        }
        return [Roles.MenuItemCheckbox, Roles.Option, Roles.Switch];
      case "color":
        return NoRole;
      case "date":
        return NoRole;
      case "datetime":
        return NoRole;
      case "email":
        return NoRole;
      case "file":
        return NoRole;
      case "hidden":
        return NoRole;
      case "image":
        return [
          Roles.Link,
          Roles.MenuItem,
          Roles.MenuItemCheckbox,
          Roles.MenuItemRadio,
          Roles.Radio,
          Roles.Switch
        ];
      case "month":
        return NoRole;
      case "number":
        return NoRole;
      case "password":
        return NoRole;
      case "radio":
        return [Roles.MenuItemRadio];
      case "range":
        return NoRole;
      case "reset":
        return NoRole;
      case "search":
        return NoRole;
      case "submit":
        return NoRole;
      case "tel":
        return NoRole;
      case "text":
        return NoRole;
      case "time":
        return NoRole;
      case "url":
        return NoRole;
      case "week":
        return NoRole;
      default:
        return NoRole;
    }
  }
  return NoRole; //The documentation does not explicitly state this
}
