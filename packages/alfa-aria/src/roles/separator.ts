import { isFocusable } from "@siteimprove/alfa-dom";
import * as Attributes from "../attributes";
import { Category, Role } from "../types";
import { Structure } from "./abstract/structure";
import { Widget } from "./abstract/widget";

/**
 * @see https://www.w3.org/TR/wai-aria/#separator
 */
export const Separator: Role = {
  name: "separator",
  category: (separator, context, device) =>
    isFocusable(separator, context, device) ? Category.Widget : Category.Structure,
  inherits: (separator, context, device) =>
    isFocusable(separator, context, device) ? [Widget] : [Structure],
  implicits: () => [
    [Attributes.Orientation, "horizontal"],
    [Attributes.ValueMinimum, "0"],
    [Attributes.ValueMaximum, "100"],
    [Attributes.ValueNow, "50"]
  ],
  label: { from: ["author"] }
};
