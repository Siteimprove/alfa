import { Keyword, Length, Percentage, Token } from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

import { List } from "./value/list";

const { map, either, delimited, option, pair, separatedList } = Parser;

/**
 * @internal
 */
export type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item =
    | [
        Length | Percentage | Keyword<"auto">,
        Length | Percentage | Keyword<"auto">
      ]
    | Keyword<"cover">
    | Keyword<"contain">;
}

/**
 * @internal
 */
export type Computed = List<Computed.Item>;

/**
 * @internal
 */
export namespace Computed {
  export type Item =
    | [
        Length<"px"> | Percentage | Keyword<"auto">,
        Length<"px"> | Percentage | Keyword<"auto">
      ]
    | Keyword<"cover">
    | Keyword<"contain">;
}

/**
 * @internal
 */
export const parse = either(
  pair(
    either(Length.parse, Keyword.parse("auto")),
    map(option(either(Length.parse, Keyword.parse("auto"))), (y) =>
      y.getOrElse(() => Keyword.of("auto"))
    )
  ),
  Keyword.parse("contain", "cover")
);

/**
 * @internal
 */
export const parseList = map(
  separatedList(
    parse,
    delimited(option(Token.parseWhitespace), Token.parseComma)
  ),
  (sizes) => List.of(sizes, ", ")
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-size}
 * @internal
 */
export default Property.of<Specified, Computed>(
  List.of([[Keyword.of("auto"), Keyword.of("auto")]], ", "),
  parseList,
  (value, style) =>
    value.map((sizes) =>
      List.of(
        Iterable.map(sizes, (size) => {
          if (Keyword.isKeyword(size)) {
            return size;
          }

          const [x, y] = size;

          return [
            x.type === "length" ? Resolver.length(x, style) : x,
            y.type === "length" ? Resolver.length(y, style) : y,
          ];
        }),
        ", "
      )
    )
);
