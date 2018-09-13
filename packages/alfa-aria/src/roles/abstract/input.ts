import { Category, Role } from "../../types";
import { Widget } from "./widget";

/**
 * @see https://www.w3.org/TR/wai-aria/#input
 */
export const Input: Role = {
  name: "input",
  category: Category.Abstract,
  inherits: () => [Widget],
  label: { from: ["author"] }
};
