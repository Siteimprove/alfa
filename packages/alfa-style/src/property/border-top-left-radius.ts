import { Length, LengthPercentage, Token, Tuple } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { takeBetween, map, delimited, option } = Parser;

type Specified = Tuple<
  [horizontal: LengthPercentage, vertical: LengthPercentage]
>;

type Computed = Tuple<
  [
    horizontal: LengthPercentage.PartiallyResolved,
    vertical: LengthPercentage.PartiallyResolved,
  ]
>;

const parse = map(
  takeBetween(
    delimited(option(Token.parseWhitespace), LengthPercentage.parse),
    1,
    2,
  ),
  ([horizontal, vertical = horizontal]) => Tuple.of(horizontal, vertical),
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
      Tuple.of(
        LengthPercentage.partiallyResolve(Resolver.length(style))(h),
        LengthPercentage.partiallyResolve(Resolver.length(style))(v),
      ),
    ),
);
