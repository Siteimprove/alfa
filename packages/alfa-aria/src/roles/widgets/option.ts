import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Input } from "../abstract/input";
import { ListBox } from "./list-box";

/**
 * @see https://www.w3.org/TR/wai-aria/#option
 */
export const Option: Role = {
  name: "option",
  category: Category.Widget,
  inherits: () => [Input],
  context: () => [ListBox],
  required: () => [Attributes.Selected],
  supported: () => [
    Attributes.Checked,
    Attributes.PositionInSet,
    Attributes.SetSize
  ],
  implicits: () => [[Attributes.Selected, "false"]],
  label: { from: ["contents", "author"], required: true }
};
