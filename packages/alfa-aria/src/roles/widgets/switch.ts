import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Checkbox } from "./checkbox";

/**
 * @see https://www.w3.org/TR/wai-aria/#switch
 */
export const Switch: Role = {
  name: "switch",
  category: Category.Widget,
  inherits: () => [Checkbox],
  required: () => [Attributes.Checked],
  implicits: () => [[Attributes.Checked, "false"]],
  label: { from: ["contents", "author"], required: true }
};
