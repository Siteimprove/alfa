import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Group } from "../structure/group";
import { ListItem } from "../structure/list-item";
import { Tree } from "./tree";
import { Option } from "./option";

/**
 * @see https://www.w3.org/TR/wai-aria/#treeitem
 */
export const TreeItem: Role = {
  name: "treeitem",
  inherits: [ListItem, Option],
  context: [Group, Tree],
  required: [Attributes.Selected],
  label: { from: ["contents", "author"], required: true }
};
