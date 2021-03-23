import { Token, Length, Number } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

import { Tuple } from "./value/tuple";

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
  export type Item = Length<"px"> | Number;
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
        (size) => size.value >= 0,
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
export default Property.of<Specified, Computed>(
  Tuple.of(Number.of(0), Number.of(0), Number.of(0), Number.of(0)),
  parse,
  (value, style) =>
    value.map(({ values: [t, r, b, l] }) =>
      Tuple.of(
        t.type === "length" ? Resolver.length(t, style) : t,
        r.type === "length" ? Resolver.length(r, style) : r,
        b.type === "length" ? Resolver.length(b, style) : b,
        l.type === "length" ? Resolver.length(l, style) : l
      )
    )
);
