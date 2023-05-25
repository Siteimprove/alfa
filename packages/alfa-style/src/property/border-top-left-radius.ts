import { Length, type Percentage, Token, Tuple } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";

import { LengthPercentage } from "./value/compound";

const { takeBetween, map, delimited, option } = Parser;

/**
 * @internal
 */
export type Specified = Tuple<
  [
    horizontal: LengthPercentage.LengthPercentage,
    vertical: LengthPercentage.LengthPercentage
  ]
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
    delimited(option(Token.parseWhitespace), LengthPercentage.parse),
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
    value.map(({ values: [h, v] }) =>
      // Percentages are relative to the size of the border box, which we don't
      // really handle currently.
      Tuple.of(
        h.type === "length" || h.type === "math expression"
          ? LengthPercentage.resolve(Length.of(0, "px"), style)(h)
          : h,
        v.type === "length" || v.type === "math expression"
          ? LengthPercentage.resolve(Length.of(0, "px"), style)(v)
          : v
      )
    )
);
