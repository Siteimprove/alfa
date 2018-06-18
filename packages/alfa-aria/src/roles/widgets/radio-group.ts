import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Select } from "../abstract/select";
import { Radio } from "./radio";

/**
 * @see https://www.w3.org/TR/wai-aria/#radiogroup
 */
export const RadioGroup: Role = {
  name: "radiogroup",
  inherits: [Select],
  owned: [Radio],
  supported: [Attributes.ReadOnly, Attributes.Required],
  label: { from: ["author"], required: true }
};
