import { Keyword, Token, Tuple } from "@siteimprove/alfa-css";
import { Element } from "@siteimprove/alfa-dom";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import type { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand.js";

import type Position from "./position.js";
import type Float from "./float.js";

const { map, either } = Parser;

type Specified =
  | Tuple<[outside: Specified.Outside, inside: Specified.Inside]>
  | Tuple<
      [
        outside: Specified.Outside,
        inside: Specified.Inside,
        listitem: Specified.ListItem,
      ]
    >
  | Tuple<[outside: Specified.Internal, inside: Specified.Inside]>
  | Tuple<[Specified.Box]>;

namespace Specified {
  /**
   * {@link https://drafts.csswg.org/css-display/#outer-role}
   */
  export type Outside =
    | Keyword<"block">
    | Keyword<"inline">
    | Keyword<"run-in">;

  /**
   * {@link https://drafts.csswg.org/css-display/#inner-model}
   */
  export type Inside =
    | Keyword<"flow">
    | Keyword<"flow-root">
    | Keyword<"table">
    | Keyword<"flex">
    | Keyword<"grid">
    | Keyword<"ruby">;

  /**
   * {@link https://drafts.csswg.org/css-display/#list-items}
   */
  export type ListItem = Keyword<"list-item">;

  /**
   * {@link https://drafts.csswg.org/css-display/#layout-specific-display}
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
   * {@link https://drafts.csswg.org/css-display/#box-generation}
   */
  export type Box = Keyword<"contents"> | Keyword<"none">;
}

type Computed = Specified;

/**
 * {@link https://drafts.csswg.org/css-display/#typedef-display-outside}
 */
const parseOutside = Keyword.parse("block", "inline", "run-in");

/**
 * {@link https://drafts.csswg.org/css-display/#typedef-display-inside}
 */
const parseInside = Keyword.parse(
  "flow",
  "flow-root",
  "table",
  "flex",
  "grid",
  "ruby",
);

/**
 * {@link https://drafts.csswg.org/css-display/#typedef-display-listitem}
 */
const parseListItem = Keyword.parse("list-item");

/**
 * {@link https://drafts.csswg.org/css-display/#typedef-display-internal}
 */
const parseInternal = Keyword.parse(
  "table-row-group",
  "table-header-group",
  "table-footer-group",
  "table-row",
  "table-cell",
  "table-column-group",
  "table-column",
  "table-caption",
  "ruby-base",
  "ruby-text",
  "ruby-base-container",
  "ruby-text-container",
);

/**
 * {@link https://drafts.csswg.org/css-display/#typedef-display-box}
 */
const parseBox = Keyword.parse("contents", "none");

/**
 * {@link https://drafts.csswg.org/css-display/#typedef-display-legacy}
 */
const parseLegacy = Keyword.parse(
  "inline-block",
  "inline-table",
  "inline-flex",
  "inline-grid",
);

const parse = either<Slice<Token>, Specified, string>(
  (input) => {
    let outside: Specified.Outside | undefined;
    let inside: Specified.Inside | undefined;
    let listItem: Specified.ListItem | undefined;

    while (true) {
      for ([input] of Token.parseWhitespace(input)) {
      }

      if (outside === undefined) {
        const result = parseOutside(input);

        if (result.isOk()) {
          [input, outside] = result.get();
          continue;
        }
      }

      if (inside === undefined) {
        const result = parseInside(input);

        if (result.isOk()) {
          [input, inside] = result.get();
          continue;
        }
      }

      if (listItem === undefined) {
        const result = parseListItem(input);

        if (result.isOk()) {
          [input, listItem] = result.get();
          continue;
        }
      }

      break;
    }

    if (
      outside === undefined &&
      inside === undefined &&
      listItem === undefined
    ) {
      return Err.of(`Expected an outer or inner display type or a list marker`);
    }

    if (inside === undefined) {
      inside = Keyword.of("flow");
    }

    if (outside === undefined) {
      outside =
        inside.value === "ruby" ? Keyword.of("inline") : Keyword.of("block");
    }

    if (listItem === undefined) {
      return Result.of([input, Tuple.of(outside, inside)]);
    }

    switch (inside.value) {
      case "flow":
      case "flow-root":
        break;
      default:
        return Err.of(`Unexpected inner display type for list marker`);
    }

    return Result.of([input, Tuple.of(outside, inside, listItem)]);
  },
  map(parseInternal, (keyword) => {
    switch (keyword.value) {
      case "table-row-group":
      case "table-header-group":
      case "table-footer-group":
      case "table-row":
      case "table-cell":
      case "table-column-group":
      case "table-column":
      case "table-caption":
        return Tuple.of(keyword, Keyword.of("flow-root"));

      case "ruby-base":
      case "ruby-text":
      case "ruby-base-container":
      case "ruby-text-container":
        return Tuple.of(keyword, Keyword.of("flow"));
    }
  }),
  map(parseBox, (keyword) => Tuple.of(keyword)),
  map(parseLegacy, (keyword) => {
    const inline = Keyword.of("inline");

    switch (keyword.value) {
      case "inline-block":
        return Tuple.of(inline, Keyword.of("flow-root"));

      case "inline-table":
        return Tuple.of(inline, Keyword.of("table"));

      case "inline-flex":
        return Tuple.of(inline, Keyword.of("flex"));

      case "inline-grid":
        return Tuple.of(inline, Keyword.of("grid"));
    }
  }),
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/display}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Tuple.of(Keyword.of("inline"), Keyword.of("flow")),
  parse,
  (value, style) => {
    // We need the type assertion to help TS break a circular type reference:
    // this -> style.computed -> Longhands.Name -> Longhands.longhands -> this.
    const position = style.computed("position").value as Longhand.Computed<
      typeof Position
    >;
    const float = style.computed("float").value as Longhand.Computed<
      typeof Float
    >;

    return position.equals(Keyword.of("absolute")) ||
      position.equals(Keyword.of("fixed")) ||
      !float.equals(Keyword.of("none"))
      ? // 4th condition of https://drafts.csswg.org/css2/#dis-pos-flo needs
        // to know whether the element is the root element, which is not
        // currently doable at that level.
        value.map(displayTable)
      : style.owner.some(Element.hasName("button"))
        ? value.map(buttonLayout)
        : value;
  },
);
/**
 * {@link https://drafts.csswg.org/css2/#dis-pos-flo}
 */
function displayTable(value: Specified): Computed {
  // Boxes are not changed by this.
  if (value.values.length === 1) {
    return value;
  }

  const [outside, inside] = value.values;

  switch (outside.value) {
    case "inline":
      switch (inside.value) {
        case "table": // => inline-table
          return Tuple.of(Keyword.of("block"), Keyword.of("table"));
        case "flow": // => inline-flow
        case "flow-root": // => inline (parses as "inline flow-root")
          return Tuple.of(Keyword.of("block"), Keyword.of("flow"));
        default:
          return value;
      }

    case "table-row-group":
    case "table-header-group":
    case "table-footer-group":
    case "table-row":
    case "table-cell":
    case "table-column-group":
    case "table-column":
    case "table-caption":
      return Tuple.of(Keyword.of("block"), Keyword.of("flow"));
    default:
      return value;
  }
}

/**
 * {@link https://html.spec.whatwg.org/multipage/rendering.html#button-layout}
 */
function buttonLayout(value: Specified): Computed {
  const [outside, inside] = value.values;

  if (inside?.is("flex", "grid")) {
    // flex, inline-flex, grid, inline-grid
    return value;
  }

  if (outside.is("contents", "none")) {
    // contents, none
    return value;
  }

  if (outside.is("inline")) {
    // inline
    return Tuple.of(Keyword.of("inline"), Keyword.of("flow-root"));
  }

  // default
  return Tuple.of(Keyword.of("block"), Keyword.of("flow-root"));
}
