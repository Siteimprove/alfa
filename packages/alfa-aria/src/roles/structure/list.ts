import { Role } from "../../types";
import { Section } from "../abstract/section";
import { Group } from "./group";
import { ListItem } from "./list-item";

/**
 * @see https://www.w3.org/TR/wai-aria/#list
 */
export const List: Role = {
  name: "list",
  inherits: [Section],
  owned: [ListItem, [Group, ListItem]],
  label: { from: ["author"] }
};
