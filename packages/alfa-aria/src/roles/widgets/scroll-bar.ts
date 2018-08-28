import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Range } from "../abstract/range";

/**
 * @see https://www.w3.org/TR/wai-aria/#scrollbar
 */
export const ScrollBar: Role = {
  name: "scrollbar",
  category: Category.Widget,
  inherits: () => [Range],
  supported: () => [
    Attributes.Controls,
    Attributes.Orientation,
    Attributes.ValueMaximum,
    Attributes.ValueMinimum,
    Attributes.ValueNow
  ],
  label: { from: ["author"] }
};
