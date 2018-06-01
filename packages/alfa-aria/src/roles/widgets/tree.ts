import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Select } from "../abstract";
import { Group } from "../structure";
import { TreeItem } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#tree
 */
export const Tree: Role = {
  name: "tree",
  inherits: [Select],
  owned: [TreeItem, [Group, TreeItem]],
  supported: [Attributes.Multiselectable, Attributes.Required],
  label: { from: ["author"], required: true }
};
