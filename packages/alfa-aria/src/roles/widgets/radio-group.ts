import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Select } from "../abstract/select";
import { Radio } from "./radio";

/**
 * @see https://www.w3.org/TR/wai-aria/#radiogroup
 */
export const RadioGroup: Role = {
  name: "radiogroup",
  category: Category.Widget,
  inherits: () => [Select],
  owned: () => [Radio],
  supported: () => [Attributes.ReadOnly, Attributes.Required],
  label: { from: ["author"], required: true }
};
