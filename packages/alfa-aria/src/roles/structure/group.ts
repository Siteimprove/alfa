import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#group
 */
export const Group: Role = {
  name: "group",
  category: Category.Structure,
  inherits: () => [Section],
  supported: () => [Attributes.ActiveDescendant],
  label: { from: ["author"] }
};
