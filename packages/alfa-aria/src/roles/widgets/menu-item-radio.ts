import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Command } from "../abstract";
import { Group } from "../structure";
import { Radio, Menu, MenuItem, MenuBar } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#menuitemradio
 */
export const MenuItemRadio: Role = {
  name: "menuitemradio",
  inherits: [Radio, MenuItem],
  context: [Group, Menu, MenuBar],
  label: { from: ["contents", "author"], required: true }
};
