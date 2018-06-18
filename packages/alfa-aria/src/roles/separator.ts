import { isFocusable } from "@siteimprove/alfa-dom";
import { Role } from "../types";
import { Structure } from "./abstract/structure";
import { Widget } from "./abstract/widget";

/**
 * @see https://www.w3.org/TR/wai-aria/#separator
 */
export const Separator: Role = {
  name: "separator",
  inherits: (separator, context) =>
    isFocusable(separator, context) ? [Widget] : [Structure],
  label: { from: ["author"] }
};
