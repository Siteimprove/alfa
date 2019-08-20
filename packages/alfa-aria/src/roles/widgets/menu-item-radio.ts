import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Group } from "../structure/group";
import { Menu } from "./menu";
import { MenuBar } from "./menu-bar";
import { MenuItemCheckbox } from "./menu-item-checkbox";
import { Radio } from "./radio";

/**
 * @see https://www.w3.org/TR/wai-aria/#menuitemradio
 */
export const MenuItemRadio: Role = {
  name: "menuitemradio",
  category: Category.Widget,
  inherits: () => [Radio, MenuItemCheckbox],
  context: () => [Group, Menu, MenuBar],
  implicits: () => [[Attributes.Checked, "false"]],
  label: { from: ["contents", "author"], required: true }
};
