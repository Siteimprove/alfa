import { Role } from "../../types";
import { Select } from "../abstract";
import { Group } from "../structure";
import { MenuItem, MenuItemCheckbox, MenuItemRadio } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#menu
 */
export const Menu: Role = {
  name: "menu",
  label: { from: ["author"] },
  inherits: [Select],
  owned: [MenuItem, MenuItemCheckbox, MenuItemRadio, [Group, MenuItemRadio]]
};
