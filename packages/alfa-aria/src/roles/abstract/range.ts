import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Widget } from "./widget";

/**
 * @see https://www.w3.org/TR/wai-aria/#range
 */
export const Range: Role = {
  name: "range",
  category: Category.Abstract,
  inherits: () => [Widget],
  supported: () => [
    Attributes.ValueMaximum,
    Attributes.ValueMinimum,
    Attributes.ValueNow,
    Attributes.ValueText
  ],
  label: { from: ["author"] }
};
