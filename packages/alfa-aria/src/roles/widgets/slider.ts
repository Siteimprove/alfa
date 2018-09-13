import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Input } from "../abstract/input";
import { Range } from "../abstract/range";

/**
 * @see https://www.w3.org/TR/wai-aria/#slider
 */
export const Slider: Role = {
  name: "slider",
  category: Category.Widget,
  inherits: () => [Input, Range],
  required: () => [
    Attributes.ValueMaximum,
    Attributes.ValueMinimum,
    Attributes.ValueNow
  ],
  supported: () => [Attributes.Orientation, Attributes.ReadOnly],
  label: { from: ["author"], required: true }
};
