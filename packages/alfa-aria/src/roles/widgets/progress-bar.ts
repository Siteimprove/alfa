import { Category, Role } from "../../types";
import { Range } from "../abstract/range";

/**
 * @see https://www.w3.org/TR/wai-aria/#progressbar
 */
export const ProgressBar: Role = {
  name: "progressbar",
  category: Category.Widget,
  inherits: () => [Range],
  label: { from: ["author"], required: true }
};
