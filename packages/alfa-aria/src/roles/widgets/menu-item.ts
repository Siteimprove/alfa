import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Command } from "../abstract/command";
import { Group } from "../structure/group";
import { Menu } from "./menu";
import { MenuBar } from "./menu-bar";

/**
 * @see https://www.w3.org/TR/wai-aria/#menuitem
 */
export const MenuItem: Role = {
  name: "menuitem",
  inherits: [Command],
  context: [Group, Menu, MenuBar],
  supported: [Attributes.Expanded],
  label: { from: ["contents", "author"], required: true }
};
