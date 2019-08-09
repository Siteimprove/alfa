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
  required: () => [
    Attributes.Controls,
    Attributes.Orientation,
    Attributes.ValueMaximum,
    Attributes.ValueMinimum,
    Attributes.ValueNow
  ],
  implicits: () => [
    [Attributes.Orientation, "vertical"],
    [Attributes.ValueMinimum, "0"],
    [Attributes.ValueMaximum, "100"],
    [Attributes.ValueNow, "50"]
  ],
  label: { from: ["author"] }
};
