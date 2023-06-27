import {
  Length,
  LengthPercentage,
  type Percentage,
  Token,
  Tuple,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { takeBetween, map, delimited, option } = Parser;

/**
 * @internal
 */
export type Specified = Tuple<
  [horizontal: LengthPercentage, vertical: LengthPercentage]
>;

/**
 * @internal
 */
export type Computed = Tuple<
  [horizontal: Computed.Item, vertical: Computed.Item]
>;

namespace Computed {
  export type Item =
    | LengthPercentage.Canonical
    // TODO: percentages resolve relative to the dimensions of the containing block,
    //       which we do not handle.
    //       This results in length-percentage calculations leaking to computed
    //       values, which is a bit annoying.
    | Percentage.Canonical
    | LengthPercentage.Calculated;
}

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
        LengthPercentage.partiallyResolve(Resolver.length(style))(h),
        LengthPercentage.partiallyResolve(Resolver.length(style))(v)
      )
    )
);
