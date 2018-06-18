import { Role } from "../../types";
import { TextBox } from "./text-box";

/**
 * @see https://www.w3.org/TR/wai-aria/#searchbox
 */
export const SearchBox: Role = {
  name: "searchbox",
  inherits: [TextBox],
  label: { from: ["author"], required: true }
};
