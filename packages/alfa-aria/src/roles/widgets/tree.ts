import * as Attributes from "../../attributes";
import { Role } from "../../types";
import { Select } from "../abstract/select";
import { Group } from "../structure/group";
import { TreeItem } from "./tree-item";

/**
 * @see https://www.w3.org/TR/wai-aria/#tree
 */
export const Tree: Role = {
  name: "tree",
  inherits: () => [Select],
  owned: () => [TreeItem, [Group, TreeItem]],
  supported: () => [Attributes.Multiselectable, Attributes.Required],
  label: { from: ["author"], required: true }
};
