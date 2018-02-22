import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Command } from "../abstract";
import { Group } from "../structure";
import { Menu, MenuBar } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#menuitem
 */
export const MenuItem: Role = {
  name: "menuitem",
  label: { from: ["author", "contents"], required: true },
  inherits: [Command],
  context: [Group, Menu, MenuBar],
  supported: [Attributes.Expanded]
};
