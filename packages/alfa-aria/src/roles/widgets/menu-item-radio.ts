import { Role } from "../../types";
import { Group } from "../structure/group";
import { Radio } from "./radio";
import { Menu } from "./menu";
import { MenuItem } from "./menu-item";
import { MenuBar } from "./menu-bar";

/**
 * @see https://www.w3.org/TR/wai-aria/#menuitemradio
 */
export const MenuItemRadio: Role = {
  name: "menuitemradio",
  inherits: () => [Radio, MenuItem],
  context: () => [Group, Menu, MenuBar],
  label: { from: ["contents", "author"], required: true }
};
