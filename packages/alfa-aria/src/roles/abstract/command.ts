import { Category, Role } from "../../types";
import { Widget } from "./widget";

/**
 * @see https://www.w3.org/TR/wai-aria/#command
 */
export const Command: Role = {
  name: "command",
  category: Category.Abstract,
  inherits: () => [Widget],
  label: { from: ["author"] }
};
