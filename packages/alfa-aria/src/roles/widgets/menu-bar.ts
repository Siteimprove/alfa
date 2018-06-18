import { Role } from "../../types";
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
  inherits: () => [Menu],
  owned: () => [
    MenuItem,
    MenuItemCheckbox,
    MenuItemRadio,
    [Group, MenuItemRadio]
  ],
  label: { from: ["author"] }
};
