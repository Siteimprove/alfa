import * as Attributes from "../../attributes";
import { Role } from "../../types";
import { Command } from "../abstract/command";
import { Group } from "../structure/group";
import { Menu } from "./menu";
import { MenuBar } from "./menu-bar";

/**
 * @see https://www.w3.org/TR/wai-aria/#menuitem
 */
export const MenuItem: Role = {
  name: "menuitem",
  inherits: () => [Command],
  context: () => [Group, Menu, MenuBar],
  supported: () => [Attributes.PositionInSet, Attributes.SetSize],
  label: { from: ["contents", "author"], required: true }
};
