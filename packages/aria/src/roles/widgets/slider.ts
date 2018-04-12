import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Input, Range } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#slider
 */
export const slider: Role = {
  name: "slider",
  inherits: [Input, Range],
  required: [
    Attributes.ValueMaximum,
    Attributes.ValueMinimum,
    Attributes.ValueNow
  ],
  supported: [Attributes.Orientation, Attributes.ReadOnly],
  label: { from: ["author"], required: true }
};
