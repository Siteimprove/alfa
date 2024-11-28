import {
  Keyword,
  List,
  LengthPercentage,
  Token,
  Tuple,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { map, either, option, pair, right } = Parser;

type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  type Dimension = LengthPercentage | Keyword<"auto">;

  export type Item =
    | Tuple<[Dimension, Dimension]>
    | Keyword<"cover">
    | Keyword<"contain">;
}

type Computed = List<Computed.Item>;

namespace Computed {
  type Dimension = LengthPercentage.PartiallyResolved | Keyword<"auto">;

  export type Item =
    | Tuple<[Dimension, Dimension]>
    | Keyword<"cover">
    | Keyword<"contain">;
}

/**
 * @internal
 */
const parseDimension = either(LengthPercentage.parse, Keyword.parse("auto"));

/**
 * @internal
 */
const parse = either(
  map(
    pair(
      parseDimension,
      map(option(right(Token.parseWhitespace, parseDimension)), (y) =>
        y.getOrElse(() => Keyword.of("auto")),
      ),
    ),
    ([x, y]) => Tuple.of(x, y),
  ),
  Keyword.parse("contain", "cover"),
);

const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
const initialItem = Tuple.of(Keyword.of("auto"), Keyword.of("auto"));

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-size}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem], ", "),
  parseList,
  (value, style) =>
    value.map((sizes) =>
      sizes.map((size) => {
        if (Keyword.isKeyword(size)) {
          return size;
        }

        const [x, y] = size.values;
        const resolver = Resolver.length(style);

        return Tuple.of(
          Keyword.isKeyword(x)
            ? x
            : LengthPercentage.partiallyResolve(resolver)(x),
          Keyword.isKeyword(y)
            ? y
            : LengthPercentage.partiallyResolve(resolver)(y),
        );
      }),
    ),
);
