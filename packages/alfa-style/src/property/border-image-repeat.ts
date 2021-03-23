import { Token, Keyword } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

import { Tuple } from "./value/tuple";

const { delimited, map, option, takeBetween } = Parser;

/**
 * @internal
 */
export type Specified = Tuple<
  [vertical: Specified.Item, horizontal: Specified.Item]
>;

/**
 * @internal
 */
export namespace Specified {
  export type Item =
    | Keyword<"stretch">
    | Keyword<"repeat">
    | Keyword<"round">
    | Keyword<"space">;
}

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = map(
  takeBetween(
    delimited(
      option(Token.parseWhitespace),
      Keyword.parse("stretch", "repeat", "round", "space")
    ),
    1,
    2
  ),
  ([vertical, horizontal = vertical]) => Tuple.of(vertical, horizontal)
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-repeat}
 * @internal
 */
export default Property.of<Specified, Computed>(
  Tuple.of(Keyword.of("stretch"), Keyword.of("stretch")),
  parse,
  (value) => value
);
