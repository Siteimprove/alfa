import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Section } from "../abstract";
import { Group, List } from "../structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#listitem
 */
export const ListItem: Role = {
  name: "listitem",
  inherits: [Section],
  context: [Group, List],
  supported: [Attributes.Level, Attributes.PositionInSet, Attributes.SetSize],
  label: { from: ["author"] }
};
