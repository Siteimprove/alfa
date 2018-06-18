import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Composite } from "../abstract/composite";
import { Input } from "../abstract/input";
import { Range } from "../abstract/range";

/**
 * @see https://www.w3.org/TR/wai-aria/#spinbutton
 */
export const SpinButton: Role = {
  name: "spinbutton",
  inherits: () => [Composite, Input, Range],
  required: () => [
    Attributes.ValueMaximum,
    Attributes.ValueMinimum,
    Attributes.ValueNow
  ],
  supported: () => [Attributes.ReadOnly, Attributes.Required],
  label: { from: ["author"], required: true }
};
