import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Select } from "../abstract/select";
import { Option } from "./option";

/**
 * @see https://www.w3.org/TR/wai-aria/#listbox
 */
export const ListBox: Role = {
  name: "listbox",
  category: Category.Widget,
  inherits: () => [Select],
  owned: () => [Option],
  required: () => [Attributes.Selected],
  supported: () => [
    Attributes.Multiselectable,
    Attributes.ReadOnly,
    Attributes.Required
  ],
  label: { from: ["author"], required: true }
};
