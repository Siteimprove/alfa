import { Values } from "../../values";

/**
 * @see https://www.w3.org/TR/css-display/#outer-role
 */
export type DisplayOutside = Values.Keyword<"block" | "inline" | "run-in">;

/**
 * @see https://www.w3.org/TR/css-display/#inner-model
 */
export type DisplayInside = Values.Keyword<
  "flow" | "flow-root" | "table" | "flex" | "grid" | "ruby"
>;

/**
 * @see https://www.w3.org/TR/css-display/#list-items
 */
export type DisplayListItem = Values.Keyword<"list-item">;

/**
 * @see https://www.w3.org/TR/css-display/#layout-specific-display
 */
export type DisplayInternal = Values.Keyword<
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
  | "ruby-text-container"
>;

/**
 * @see https://www.w3.org/TR/css-display/#box-generation
 */
export type DisplayBox = Values.Keyword<"contents" | "none">;

export type Display =
  | DisplayInternal
  | DisplayBox
  | Values.Tuple<[DisplayOutside, DisplayInside]>
  | Values.Tuple<[DisplayOutside, DisplayInside, DisplayListItem]>;
