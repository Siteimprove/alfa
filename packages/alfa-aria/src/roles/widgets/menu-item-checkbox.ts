import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Checkbox } from "./checkbox";
import { Menu } from "./menu";
import { MenuBar } from "./menu-bar";
import { MenuItem } from "./menu-item";

/**
 * @see https://www.w3.org/TR/wai-aria/#menuitemcheckbox
 */
export const MenuItemCheckbox: Role = {
  name: "menuitemcheckbox",
  category: Category.Widget,
  inherits: () => [Checkbox, MenuItem],
  context: () => [Menu, MenuBar],
  implicits: () => [[Attributes.Checked, "false"]],
  label: { from: ["contents", "author"], required: true }
};
