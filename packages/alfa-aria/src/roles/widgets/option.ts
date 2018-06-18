import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Input } from "../abstract/input";
import { ListBox } from "./list-box";

/**
 * @see https://www.w3.org/TR/wai-aria/#option
 */
export const Option: Role = {
  name: "option",
  inherits: () => [Input],
  context: () => [ListBox],
  required: () => [Attributes.Selected],
  supported: () => [
    Attributes.Checked,
    Attributes.PositionInSet,
    Attributes.SetSize
  ],
  label: { from: ["contents", "author"], required: true }
};
