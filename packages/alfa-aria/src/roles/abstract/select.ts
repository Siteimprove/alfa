import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Group } from "../structure/group";
import { Composite } from "./composite";

/**
 * @see https://www.w3.org/TR/wai-aria/#select
 */
export const Select: Role = {
  name: "select",
  category: Category.Abstract,
  inherits: () => [Composite, Group],
  supported: () => [Attributes.Orientation],
  label: { from: ["author"] }
};
