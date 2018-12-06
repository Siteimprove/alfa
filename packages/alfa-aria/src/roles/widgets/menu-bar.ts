import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Group } from "../structure/group";
import { Menu } from "./menu";
import { MenuItem } from "./menu-item";
import { MenuItemCheckbox } from "./menu-item-checkbox";
import { MenuItemRadio } from "./menu-item-radio";

/**
 * @see https://www.w3.org/TR/wai-aria/#menubar
 */
export const MenuBar: Role = {
  name: "menubar",
  category: Category.Widget,
  inherits: () => [Menu],
  owned: () => [
    MenuItem,
    MenuItemCheckbox,
    MenuItemRadio,
    [Group, MenuItemRadio]
  ],
  implicits: () => [[Attributes.Orientation, "horizontal"]],
  label: { from: ["author"] }
};
