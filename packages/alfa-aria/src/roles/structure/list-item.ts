import * as Attributes from "../../attributes";
import { Role } from "../../types";
import { Section } from "../abstract/section";
import { Group } from "./group";
import { List } from "./list";

/**
 * @see https://www.w3.org/TR/wai-aria/#listitem
 */
export const ListItem: Role = {
  name: "listitem",
  inherits: () => [Section],
  context: () => [Group, List],
  supported: () => [
    Attributes.Level,
    Attributes.PositionInSet,
    Attributes.SetSize
  ],
  label: { from: ["author"] }
};
