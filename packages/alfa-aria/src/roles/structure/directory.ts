import { Category, Role } from "../../types";
import { List } from "./list";

/**
 * @see https://www.w3.org/TR/wai-aria/#directory
 */
export const Directory: Role = {
  name: "directory",
  category: Category.Structure,
  inherits: () => [List],
  label: { from: ["author"] }
};
