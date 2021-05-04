import { Keyword, Length, Percentage, Token } from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";
import { Resolver } from "../resolver";

import { List } from "./value/list";
import parseWhitespace = Token.parseWhitespace;

const { map, either, delimited, option, pair, right, separatedList } = Parser;

declare module "../property" {
  interface Longhands {
    "background-size": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Dimension = Length | Percentage | Keyword<"auto">;

  export type Item =
    | [Dimension, Dimension]
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
  export type Dimension = Length<"px"> | Percentage | Keyword<"auto">;

  export type Item =
    | [Dimension, Dimension]
    | Keyword<"cover">
    | Keyword<"contain">;
}

/**
 * @internal
 */
const parseDimension = either<Slice<Token>, Specified.Dimension, string>(
  Length.parse,
  Percentage.parse,
  Keyword.parse("auto")
);

/**
 * @internal
 */
export const parse = either(
  pair(
    parseDimension,
    map(option(right(parseWhitespace, parseDimension)), (y) =>
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
export default Property.register(
  "background-size",
  Property.of<Specified, Computed>(
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
  )
);
