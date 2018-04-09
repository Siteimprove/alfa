import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Section } from "../abstract";
import { Group, ListItem } from "../structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#list
 */
export const List: Role = {
  name: "list",
  inherits: [Section],
  owned: [ListItem, [Group, ListItem]],
  label: { from: ["author"] }
};
