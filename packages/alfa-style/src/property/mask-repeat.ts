import { Keyword, List, Tuple } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either, map } = Parser;

type Specified = List<Specified.Item>;

type LonghandValue =
  | Keyword<"repeat">
  | Keyword<"space">
  | Keyword<"round">
  | Keyword<"no-repeat">;

/**
 * @internal
 */
export namespace Specified {
  export type Item =
    | Keyword<"repeat-x">
    | Keyword<"repeat-y">
    | Tuple<[LonghandValue, LonghandValue]>;
}

type Computed = List<Tuple<[LonghandValue, LonghandValue]>>;

/**
 * @internal
 */
export const parse = either(
  Keyword.parse("repeat-x", "repeat-y"),
  map(
    List.parseSpaceSeparated(
      Keyword.parse("repeat", "space", "round", "no-repeat"),
      1,
      2,
    ),
    ([horizontal, vertical = horizontal]) => Tuple.of(horizontal, vertical),
  ),
);

const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = Tuple.of(Keyword.of("repeat"), Keyword.of("repeat"));

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-repeat}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem], ", "),
  parseList,
  (value, style) => {
    const layers = Resolver.layers(style, "mask-image");
    return value.map((values) =>
      layers(
        values.map((value) =>
          Selective.of(value)
            .if(Keyword.isKeyword, (keyword) =>
              keyword.is("repeat-x")
                ? Tuple.of(Keyword.of("repeat"), Keyword.of("no-repeat"))
                : Tuple.of(Keyword.of("no-repeat"), Keyword.of("repeat")),
            )
            .get(),
        ),
      ),
    );
  },
);
