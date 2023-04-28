import { Token, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

import { Tuple } from "./value/tuple";

const { takeBetween, either, map, delimited, option } = Parser;

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
export default Longhand.of<Specified, Computed>(
  Tuple.of(Length.of(0, "px"), Length.of(0, "px")),
  parse,
  (value, style) =>
    value.map(({ values: [h, v] }) => {
      return Tuple.of(
        h.type === "length" ? Resolver.length(h, style) : h,
        v.type === "length" ? Resolver.length(v, style) : v
      );
    })
);
