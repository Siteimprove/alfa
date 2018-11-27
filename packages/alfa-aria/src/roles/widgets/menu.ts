import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Select } from "../abstract/select";
import { Group } from "../structure/group";
import { MenuItem } from "./menu-item";
import { MenuItemCheckbox } from "./menu-item-checkbox";
import { MenuItemRadio } from "./menu-item-radio";

/**
 * @see https://www.w3.org/TR/wai-aria/#menu
 */
export const Menu: Role = {
  name: "menu",
  category: Category.Widget,
  inherits: () => [Select],
  owned: () => [
    MenuItem,
    MenuItemCheckbox,
    MenuItemRadio,
    [Group, MenuItemRadio]
  ],
  implicits: () => [[Attributes.Orientation, "vertical"]],
  label: { from: ["author"] }
};
