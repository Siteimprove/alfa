import { Keyword } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

const { map, either } = Parser;

/**
 * @internal
 */
export type Specified =
  | readonly [Specified.Internal]
  | readonly [Specified.Box]
  | readonly [Specified.Outside, Specified.Inside]
  | readonly [Specified.Outside, Specified.Inside, Specified.ListItem];

/**
 * @internal
 */
export namespace Specified {
  /**
   * @see https://drafts.csswg.org/css-display/#outer-role
   */
  export type Outside =
    | Keyword<"block">
    | Keyword<"inline">
    | Keyword<"run-in">;

  /**
   * @see https://drafts.csswg.org/css-display/#inner-model
   */
  export type Inside =
    | Keyword<"flow">
    | Keyword<"flow-root">
    | Keyword<"table">
    | Keyword<"flex">
    | Keyword<"grid">
    | Keyword<"ruby">;

  /**
   * @see https://drafts.csswg.org/css-display/#list-items
   */
  export type ListItem = Keyword<"list-item">;

  /**
   * @see https://drafts.csswg.org/css-display/#layout-specific-display
   */
  export type Internal =
    | Keyword<"table-row-group">
    | Keyword<"table-header-group">
    | Keyword<"table-footer-group">
    | Keyword<"table-row">
    | Keyword<"table-cell">
    | Keyword<"table-column-group">
    | Keyword<"table-column">
    | Keyword<"table-caption">
    | Keyword<"ruby-base">
    | Keyword<"ruby-text">
    | Keyword<"ruby-base-container">
    | Keyword<"ruby-text-container">;

  /**
   * @see https://drafts.csswg.org/css-display/#box-generation
   */
  export type Box = Keyword<"contents"> | Keyword<"none">;
}

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = either(
  map(Keyword.parse("contents", "none"), (keyword) => [keyword] as const),
  either(
    map(
      Keyword.parse("block", "inline", "run-in"),
      (keyword) => [keyword, Keyword.of("flow")] as const
    ),
    either(
      map(
        Keyword.parse("flow", "flow-root", "table", "flex", "grid", "ruby"),
        (keyword) =>
          [
            keyword.value === "ruby"
              ? Keyword.of("inline")
              : Keyword.of("block"),
            keyword,
          ] as const
      ),
      map(
        Keyword.parse(
          "inline-block",
          "inline-table",
          "inline-flex",
          "inline-grid"
        ),
        (keyword) => {
          const inline = Keyword.of("inline");

          switch (keyword.value) {
            case "inline-block":
              return [inline, Keyword.of("flow-root")] as const;

            case "inline-table":
              return [inline, Keyword.of("table")] as const;

            case "inline-flex":
              return [inline, Keyword.of("flex")] as const;

            case "inline-grid":
              return [inline, Keyword.of("grid")] as const;
          }
        }
      )
    )
  )
);

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/display
 * @internal
 */
export default Property.of<Specified, Computed>(
  [Keyword.of("inline"), Keyword.of("flow")],
  parse,
  (value) => value
);
