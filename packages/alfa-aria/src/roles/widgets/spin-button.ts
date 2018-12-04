import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Composite } from "../abstract/composite";
import { Input } from "../abstract/input";
import { Range } from "../abstract/range";

/**
 * @see https://www.w3.org/TR/wai-aria/#spinbutton
 */
export const SpinButton: Role = {
  name: "spinbutton",
  category: Category.Widget,
  inherits: () => [Composite, Input, Range],
  required: () => [
    Attributes.ValueMaximum,
    Attributes.ValueMinimum,
    Attributes.ValueNow
  ],
  supported: () => [Attributes.ReadOnly, Attributes.Required],
  implicits: () => [
    [Attributes.ValueMinimum, ""],
    [Attributes.ValueMaximum, ""],
    [Attributes.ValueNow, "0"]
  ],
  label: { from: ["author"], required: true }
};
