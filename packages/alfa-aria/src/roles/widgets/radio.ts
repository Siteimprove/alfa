import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Input } from "../abstract/input";

/**
 * @see https://www.w3.org/TR/wai-aria/#radio
 */
export const Radio: Role = {
  name: "radio",
  category: Category.Widget,
  inherits: () => [Input],
  required: () => [Attributes.Checked],
  supported: () => [Attributes.PositionInSet, Attributes.SetSize],
  label: { from: ["contents", "author"], required: true }
};
