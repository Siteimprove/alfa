import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Section } from "../abstract";
import { Group, ListItem } from "../structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#list
 */
export const List: Role = {
  name: "list",
  label: { from: ["author"] },
  inherits: [Section],
  owned: [ListItem, [Group, ListItem]]
};
