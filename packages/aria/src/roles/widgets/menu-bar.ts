import { Role } from "../../types";
import { Group } from "../structure";
import { Menu, MenuItem, MenuItemCheckbox, MenuItemRadio } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#menubar
 */
export const MenuBar: Role = {
  name: "menubar",
  inherits: [Menu],
  owned: [MenuItem, MenuItemCheckbox, MenuItemRadio, [Group, MenuItemRadio]],
  label: { from: ["author"] }
};
