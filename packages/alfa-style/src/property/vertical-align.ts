import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    "vertical-align": Property<Specified, Computed>;
  }
}

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
export default Property.register(
  "vertical-align",
  Property.of<Specified, Computed>(
    Keyword.of("baseline"),
    parse,
    (value, style) =>
      value.map((verticalAlign) => {
        switch (verticalAlign.type) {
          case "keyword":
            return verticalAlign;
          case "percentage": {
            const lineHeight = style.computed("line-height").value;
            switch (lineHeight.type) {
              case "keyword": // "normal", used of 1.2
                return Length.of(
                  1.2 *
                    style.computed("font-size").value.value *
                    verticalAlign.value,
                  "px"
                );
              case "length":
                return Length.of(lineHeight.value * verticalAlign.value, "px");
              case "number":
                return Length.of(
                  lineHeight.value *
                    style.computed("font-size").value.value *
                    verticalAlign.value,
                  "px"
                );
            }
          }
          case "length":
            return Resolver.length(verticalAlign, style);
        }
      })
  )
);
