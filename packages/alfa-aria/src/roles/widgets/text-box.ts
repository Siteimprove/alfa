import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Input } from "../abstract/input";

/**
 * @see https://www.w3.org/TR/wai-aria/#textbox
 */
export const TextBox: Role = {
  name: "textbox",
  category: Category.Widget,
  inherits: () => [Input],
  supported: () => [
    Attributes.ActiveDescendant,
    Attributes.Autocomplete,
    Attributes.Multiline,
    Attributes.Placeholder,
    Attributes.ReadOnly,
    Attributes.Required
  ],
  label: { from: ["author"], required: true }
};
