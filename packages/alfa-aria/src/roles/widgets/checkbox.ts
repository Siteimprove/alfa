import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Input } from "../abstract/input";

/**
 * @see https://www.w3.org/TR/wai-aria/#checkbox
 */
export const Checkbox: Role = {
  name: "checkbox",
  category: Category.Widget,
  inherits: () => [Input],
  required: () => [Attributes.Checked],
  supported: () => [Attributes.ReadOnly],
  label: { from: ["contents", "author"], required: true }
};
