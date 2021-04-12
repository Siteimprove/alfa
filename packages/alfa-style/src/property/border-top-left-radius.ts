import { Token, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

import { Tuple } from "./value/tuple";

const { takeBetween, either, map, delimited, option } = Parser;

declare module "../property" {
  interface Longhands {
    "border-top-left-radius": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = Tuple<
  [horizontal: Length | Percentage, vertical: Length | Percentage]
>;

/**
 * @internal
 */
export type Computed = Tuple<
  [horizontal: Length<"px"> | Percentage, vertical: Length<"px"> | Percentage]
>;

/**
 * @internal
 */
export const parse = map(
  takeBetween(
    delimited(
      option(Token.parseWhitespace),
      either(Length.parse, Percentage.parse)
    ),
    1,
    2
  ),
  ([horizontal, vertical = horizontal]) => Tuple.of(horizontal, vertical)
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-left-radius}
 * @internal
 */
export default Property.register(
  "border-top-left-radius",
  Property.of<Specified, Computed>(
    Tuple.of(Length.of(0, "px"), Length.of(0, "px")),
    parse,
    (value, style) =>
      value.map(({ values: [h, v] }) => {
        return Tuple.of(
          h.type === "length" ? Resolver.length(h, style) : h,
          v.type === "length" ? Resolver.length(v, style) : v
        );
      })
  )
);
