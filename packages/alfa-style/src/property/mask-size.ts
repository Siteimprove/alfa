import { Keyword, LengthPercentage, List, Tuple } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either, map } = Parser;

type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item =
    | Tuple<
        [LengthPercentage | Keyword<"auto">, LengthPercentage | Keyword<"auto">]
      >
    | Keyword<"cover">
    | Keyword<"contain">;
}

type Computed = Specified;

/**
 * @internal
 */
export const parse = either(
  map(
    List.parseSpaceSeparated(
      either(LengthPercentage.parse, Keyword.parse("auto")),
      1,
      2,
    ),
    ([horizontal, vertical = horizontal]) => Tuple.of(horizontal, vertical),
  ),
  Keyword.parse("cover", "contain"),
);

const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = Tuple.of(Keyword.of("auto"), Keyword.of("auto"));

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-size}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem], ", "),
  parseList,
  (value, style) => {
    const layers = Resolver.layers(style, "mask-image");
    const lengthResolver = LengthPercentage.partiallyResolve(
      Resolver.length(style),
    );

    return value.map((sizes) =>
      layers(
        sizes.map((size) =>
          Selective.of(size)
            .if(Tuple.isTuple, (tuple) => {
              const [h, v] = tuple.values;
              return Tuple.of(
                Keyword.isKeyword(h) ? h : lengthResolver(h),
                Keyword.isKeyword(v) ? v : lengthResolver(v),
              );
            })
            .get(),
        ),
      ),
    );
  },
);
