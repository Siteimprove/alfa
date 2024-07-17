import {
  Keyword,
  LengthPercentage,
  Number,
  Token,
  Tuple,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";
import type { Style } from "../style.js";

const { takeBetween, either, map, filter, delimited, option } = Parser;

/**
 * @internal
 */
export type Specified = Tuple<
  [
    top: Specified.Item,
    right: Specified.Item,
    bottom: Specified.Item,
    left: Specified.Item,
  ]
>;

namespace Specified {
  export type Item = LengthPercentage | Number | Keyword<"auto">;
}

type Computed = Tuple<
  [
    top: Computed.Item,
    right: Computed.Item,
    bottom: Computed.Item,
    left: Computed.Item,
  ]
>;

namespace Computed {
  export type Item =
    | LengthPercentage.PartiallyResolved
    | Number.Canonical
    | Keyword<"auto">;
}

/**
 * @internal
 */
export const parse = map(
  takeBetween(
    delimited(
      option(Token.parseWhitespace),
      either(
        filter(
          either(LengthPercentage.parse, Number.parse),
          (size) => size.hasCalculation() || size.value >= 0,
          () => `Negative sizes are not allowed`,
        ),
        Keyword.parse("auto"),
      ),
    ),
    1,
    4,
  ),
  ([top, right = top, bottom = top, left = right]) =>
    Tuple.of(top, right, bottom, left),
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-width}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Tuple.of(Number.of(1), Number.of(1), Number.of(1), Number.of(1)),
  parse,
  (value, style) =>
    value.map(({ values: [t, r, b, l] }) => {
      const resolver = resolve(style);
      return Tuple.of(resolver(t), resolver(r), resolver(b), resolver(l));
    }),
);

function resolve(style: Style): (specified: Specified.Item) => Computed.Item {
  return (specified) =>
    Selective.of(specified)
      .if(
        LengthPercentage.isLengthPercentage,
        LengthPercentage.partiallyResolve(Resolver.length(style)),
      )
      .if(Number.isNumber, (num) => num.resolve())
      .get();
}
