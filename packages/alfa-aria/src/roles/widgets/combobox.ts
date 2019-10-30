import { Element, getAttribute, Node } from "@siteimprove/alfa-dom";
import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Select } from "../abstract/select";
import { Dialog } from "../window/dialog";
import { Grid } from "./grid";
import { ListBox } from "./list-box";
import { TextBox } from "./text-box";
import { Tree } from "./tree";

/**
 * @see https://www.w3.org/TR/wai-aria/#combobox
 */
export const Combobox: Role = {
  name: "combobox",
  category: Category.Widget,
  inherits: () => [Select],
  owned,
  required: () => [Attributes.Controls, Attributes.Expanded],
  supported: () => [
    Attributes.Autocomplete,
    Attributes.ReadOnly,
    Attributes.Required
  ],
  implicits: () => [
    [Attributes.Expanded, "false"],
    [Attributes.HasPopup, "listbox"]
  ],
  label: { from: ["author"], required: true }
};

function owned(combobox: Element, context: Node): Array<Role | [Role, Role]> {
  if (getAttribute(combobox, context, "expanded").includes("true")) {
    return [TextBox, ListBox, Tree, Grid, Dialog];
  }

  return [TextBox];
}
