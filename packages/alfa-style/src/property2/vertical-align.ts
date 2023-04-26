import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

import type { Computed as FontSize } from "./font-size";
import type { Computed as LineHeight } from "./line-height";

const { either } = Parser;

type keywords =
  | Keyword<"baseline">
  | Keyword<"sub">
  | Keyword<"super">
  | Keyword<"text-top">
  | Keyword<"text-bottom">
  | Keyword<"middle">
  | Keyword<"top">
  | Keyword<"bottom">;

/**
 * @internal
 */
export type Specified = keywords | Length | Percentage;
/**
 * @internal
 */
export type Computed = keywords | Length<"px">;

/**
 * @internal
 */

export const parse = either(
  Keyword.parse(
    "baseline",
    "sub",
    "super",
    "text-top",
    "text-bottom",
    "middle",
    "top",
    "bottom"
  ),
  either(Length.parse, Percentage.parse)
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("baseline"),
  parse,
  (value, style) =>
    value.map((verticalAlign) => {
      switch (verticalAlign.type) {
        case "keyword":
          return verticalAlign;
        case "percentage": {
          // We need the type assertion to help TS break a circular type reference:
          // this -> style.computed -> Longhands.Name -> Longhands.longhands -> this.
          const lineHeight = style.computed("line-height").value as LineHeight;
          const fontSize = style.computed("font-size").value as FontSize;

          switch (lineHeight.type) {
            case "keyword": // "normal", used of 1.2
              return Length.of(
                1.2 * fontSize.value * verticalAlign.value,
                "px"
              );
            case "length":
              return Length.of(lineHeight.value * verticalAlign.value, "px");
            case "number":
              return Length.of(
                lineHeight.value * fontSize.value * verticalAlign.value,
                "px"
              );
          }
        }
        case "length":
          return Resolver.length(verticalAlign, style);
      }
    })
);
