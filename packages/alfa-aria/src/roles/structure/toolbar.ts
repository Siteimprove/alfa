import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Group } from "./group";

/**
 * @see https://www.w3.org/TR/wai-aria/#toolbar
 */
export const Toolbar: Role = {
  name: "toolbar",
  category: Category.Structure,
  inherits: () => [Group],
  supported: () => [Attributes.Orientation],
  implicits: () => [[Attributes.Orientation, "horizontal"]],
  label: { from: ["author"] }
};
