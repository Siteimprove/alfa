import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Group } from "../structure/group";
import { ListItem } from "../structure/list-item";
import { Option } from "./option";
import { Tree } from "./tree";

/**
 * @see https://www.w3.org/TR/wai-aria/#treeitem
 */
export const TreeItem: Role = {
  name: "treeitem",
  category: Category.Widget,
  inherits: () => [ListItem, Option],
  context: () => [Group, Tree],
  required: () => [Attributes.Selected],
  label: { from: ["contents", "author"], required: true }
};
