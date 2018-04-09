import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Input } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#checkbox
 */
export const Checkbox: Role = {
  name: "checkbox",
  inherits: [Input],
  required: [Attributes.Checked],
  supported: [Attributes.ReadOnly],
  label: { from: ["author", "contents"], required: true }
};
