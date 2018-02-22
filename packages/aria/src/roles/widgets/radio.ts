import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Input } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#radio
 */
export const Radio: Role = {
  name: "radio",
  label: { from: ["author", "contents"], required: true },
  inherits: [Input],
  required: [Attributes.Checked],
  supported: [Attributes.PositionInSet, Attributes.SetSize]
};
