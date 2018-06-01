import { isFocusable } from "@alfa/dom";
import { Role } from "../types";
import { Structure, Widget } from "./abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#separator
 */
export const Separator: Role = {
  name: "separator",
  inherits: separator => (isFocusable(separator) ? [Widget] : [Structure]),
  label: { from: ["author"] }
};
