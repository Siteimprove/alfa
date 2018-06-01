import { Role } from "../../types";
import { Checkbox, Menu, MenuItem, MenuBar } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#menuitemcheckbox
 */
export const MenuItemCheckbox: Role = {
  name: "menuitemcheckbox",
  inherits: [Checkbox, MenuItem],
  context: [Menu, MenuBar],
  label: { from: ["contents", "author"], required: true }
};
