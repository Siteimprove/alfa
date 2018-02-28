import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Input } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#textbox
 */
export const TextBox: Role = {
  name: "textbox",
  label: { from: ["author"], required: true },
  inherits: [Input],
  supported: [
    Attributes.ActiveDescendant,
    Attributes.Autocomplete,
    Attributes.Multiline,
    Attributes.Placeholder,
    Attributes.ReadOnly,
    Attributes.Required
  ]
};
