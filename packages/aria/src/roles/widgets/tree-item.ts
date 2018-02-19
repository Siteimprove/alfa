import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Select } from "../abstract";
import { Group, ListItem } from "../structure";
import { Tree, Option } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#treeitem
 */
export const TreeItem: Role = {
  name: "treeitem",
  label: { from: ["author", "contents"], required: true },
  inherits: [ListItem, Option],
  context: [Group, Tree],
  required: [Attributes.Selected]
};
