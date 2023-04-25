import {
  Token,
  Length,
  Number,
  Percentage,
  Keyword,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";
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
  export type Item = Length | Percentage | Number | Keyword<"auto">;
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
  export type Item = Length<"px"> | Percentage | Number | Keyword<"auto">;
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
          either(Length.parse, either(Percentage.parse, Number.parse)),
          (size) => size.value >= 0,
          () => `Negative sizes are not allowed`
        ),
        Keyword.parse("auto")
      )
    ),
    1,
    4
  ),
  ([top, right = top, bottom = top, left = right]) =>
    Tuple.of(top, right, bottom, left)
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-width}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Tuple.of(Number.of(1), Number.of(1), Number.of(1), Number.of(1)),
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
