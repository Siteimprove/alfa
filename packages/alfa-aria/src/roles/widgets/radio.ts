import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Input } from "../abstract/input";

/**
 * @see https://www.w3.org/TR/wai-aria/#radio
 */
export const Radio: Role = {
  name: "radio",
  inherits: () => [Input],
  required: () => [Attributes.Checked],
  supported: () => [Attributes.PositionInSet, Attributes.SetSize],
  label: { from: ["contents", "author"], required: true }
};
