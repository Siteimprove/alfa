import { Element, getAttribute, Node } from "@siteimprove/alfa-dom";
import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Select } from "../abstract/select";
import { Dialog } from "../window/dialog";
import { TextBox } from "./text-box";
import { ListBox } from "./list-box";
import { Tree } from "./tree";
import { Grid } from "./grid";

/**
 * @see https://www.w3.org/TR/wai-aria/#combobox
 */
export const Combobox: Role = {
  name: "combobox",
  inherits: [Select],
  owned,
  required: [Attributes.Controls, Attributes.Expanded],
  supported: [
    Attributes.Autocomplete,
    Attributes.ReadOnly,
    Attributes.Required
  ],
  label: { from: ["author"], required: true }
};

function owned(combobox: Element, context: Node): Array<Role | [Role, Role]> {
  if (getAttribute(combobox, "expanded") === "true") {
    return [TextBox, ListBox, Tree, Grid, Dialog];
  }

  return [TextBox];
}
