import { Role } from "../../types";
import { TextBox } from "../widgets";

/**
 * @see https://www.w3.org/TR/wai-aria/#searchbox
 */
export const SearchBox: Role = {
  name: "searchbox",
  label: { from: "author", required: true },
  inherits: [TextBox]
};
