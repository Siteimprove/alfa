import { parse } from "@siteimprove/alfa-lang";
import { DisplayGrammar } from "../grammars/display";
import { Property } from "../types";

/**
 * @see https://www.w3.org/TR/css-display/#outer-role
 */
export type DisplayOutside = "block" | "inline" | "run-in";

/**
 * @see https://www.w3.org/TR/css-display/#inner-model
 */
export type DisplayInside =
  | "flow"
  | "flow-root"
  | "table"
  | "flex"
  | "grid"
  | "ruby";

/**
 * @see https://www.w3.org/TR/css-display/#list-items
 */
export type DisplayListItem = "list-item";

/**
 * @see https://www.w3.org/TR/css-display/#layout-specific-display
 */
export type DisplayInternal =
  | "table-row-group"
  | "table-header-group"
  | "table-footer-group"
  | "table-row"
  | "table-cell"
  | "table-column-group"
  | "table-column"
  | "table-caption"
  | "ruby-base"
  | "ruby-text"
  | "ruby-base-container"
  | "ruby-text-container";

/**
 * @see https://www.w3.org/TR/css-display/#box-generation
 */
export type DisplayBox = "contents" | "none";

export type Display =
  | [DisplayOutside, DisplayInside]
  | [DisplayOutside, DisplayInside, DisplayListItem]
  | DisplayInternal
  | DisplayBox;

/**
 * @see https://www.w3.org/TR/css-display/#propdef-display
 */
export const DisplayProperty: Property<Display> = {
  parse(input) {
    return parse(input, DisplayGrammar);
  },
  initial: ["inline", "flow"],
  computed(own, parent) {
    return own.display === undefined ? null : own.display;
  }
};
