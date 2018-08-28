import { Category, Role } from "../../types";
import { Group } from "../structure/group";
import { Menu } from "./menu";
import { MenuBar } from "./menu-bar";
import { MenuItem } from "./menu-item";
import { Radio } from "./radio";

/**
 * @see https://www.w3.org/TR/wai-aria/#menuitemradio
 */
export const MenuItemRadio: Role = {
  name: "menuitemradio",
  category: Category.Widget,
  inherits: () => [Radio, MenuItem],
  context: () => [Group, Menu, MenuBar],
  label: { from: ["contents", "author"], required: true }
};
