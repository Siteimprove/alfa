import { Keyword } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

const { map, either } = Parser;

export namespace Display {
  /**
   * @see https://drafts.csswg.org/css-display/#outer-role
   */
  export type Outside = Keyword<"block" | "inline" | "run-in">;

  /**
   * @see https://drafts.csswg.org/css-display/#inner-model
   */
  export type Inside = Keyword<
    "flow" | "flow-root" | "table" | "flex" | "grid" | "ruby"
  >;

  /**
   * @see https://drafts.csswg.org/css-display/#list-items
   */
  export type ListItem = Keyword<"list-item">;

  /**
   * @see https://drafts.csswg.org/css-display/#layout-specific-display
   */
  export type Internal = Keyword<
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
   * @see https://drafts.csswg.org/css-display/#box-generation
   */
  export type Box = Keyword<"contents" | "none">;
}

export type Display =
  | [Display.Internal]
  | [Display.Box]
  | [Display.Outside, Display.Inside]
  | [Display.Outside, Display.Inside, Display.ListItem];

/**
 * @see https://drafts.csswg.org/css-display/#propdef-display
 */
const Display: Property<Display> = Property.of(
  [Keyword.of("inline"), Keyword.of("flow")],
  either(
    map(Keyword.parse("contents", "none"), box => [box]),
    map(Keyword.parse("block", "inline", "run-in"), outside => [
      outside,
      Keyword.of("flow")
    ])
  ),
  style => style.specified("display")
);

export default Display;
