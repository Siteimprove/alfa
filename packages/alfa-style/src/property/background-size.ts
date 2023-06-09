import {
  Keyword,
  Length,
  List,
  Percentage,
  Token,
  Tuple,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";

import { LengthPercentage } from "./value/compound";

const { map, either, option, pair, right } = Parser;

/**
 * @internal
 */
export type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Dimension = LengthPercentage.LengthPercentage | Keyword<"auto">;

  export type Item =
    | Tuple<[Dimension, Dimension]>
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
export const parse = either(
  map(
    pair(
      parseDimension,
      map(option(right(Token.parseWhitespace, parseDimension)), (y) =>
        y.getOrElse(() => Keyword.of("auto"))
      )
    ),
    ([x, y]) => Tuple.of(x, y)
  ),
  Keyword.parse("contain", "cover")
);

/**
 * @internal
 */
export const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = Tuple.of(Keyword.of("auto"), Keyword.of("auto"));

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

        // Percentages are relative to the size of the background positioning
        // area, which we don't really handle currently.
        return Tuple.of(
          x.type === "length" || x.type === "math expression"
            ? LengthPercentage.resolve(Length.of(0, "px"), style)(x)
            : x,
          y.type === "length" || y.type === "math expression"
            ? LengthPercentage.resolve(Length.of(0, "px"), style)(y)
            : y
        );
      })
    )
);
