import { Length, Number, Token, Tuple } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";
import { Style } from "../style";

const { takeBetween, either, map, filter, delimited, option } = Parser;

/**
 * @internal
 */
export type Specified = Tuple<
  [
    top: Specified.Item,
    right: Specified.Item,
    bottom: Specified.Item,
    left: Specified.Item
  ]
>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Length | Number;
}

/**
 * @internal
 */
export type Computed = Tuple<
  [
    top: Computed.Item,
    right: Computed.Item,
    bottom: Computed.Item,
    left: Computed.Item
  ]
>;

/**
 * @internal
 */
export namespace Computed {
  export type Item = Length.Fixed<"px"> | Number;
}

/**
 * @internal
 */
export const parse = map(
  takeBetween(
    delimited(
      option(Token.parseWhitespace),
      filter(
        either(Length.parse, Number.parse),
        (size) => size.hasCalculation() || size.value >= 0,
        () => `Negative sizes are not allowed`
      )
    ),
    1,
    4
  ),
  ([top, right = top, bottom = top, left = right]) =>
    Tuple.of(top, right, bottom, left)
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-outset}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Tuple.of(Number.of(0), Number.of(0), Number.of(0), Number.of(0)),
  parse,
  (value, style) =>
    value.map(({ values: [t, r, b, l] }) => {
      const resolver = resolve(style);
      return Tuple.of(resolver(t), resolver(r), resolver(b), resolver(l));
    })
);

function resolve(style: Style): (specified: Specified.Item) => Computed.Item {
  const resolver = Resolver.length(style);
  return (specified) =>
    Length.isLength(specified) ? specified.resolve(resolver) : specified;
}
