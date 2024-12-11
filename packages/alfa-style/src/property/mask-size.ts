import { Keyword, LengthPercentage, List } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item =
    | List<LengthPercentage | Keyword<"auto">>
    | Keyword<"cover">
    | Keyword<"contain">;
}

type Computed = Specified;

/**
 * @internal
 */
export const parse = either(
  List.parseSpaceSeparated(
    either(LengthPercentage.parse, Keyword.parse("auto")),
    1,
    2,
  ),
  Keyword.parse("cover", "contain"),
);

const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = List.of([Keyword.of("auto")], " ");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-size}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem], ", "),
  parseList,
  (value, style) => {
    const layers = Resolver.layers<Specified.Item>(style, "mask-image");

    return value.map((sizes) =>
      layers(
        sizes.map((size) =>
          Keyword.isKeyword(size)
            ? size
            : size.map((value) =>
                Keyword.isKeyword(value)
                  ? value
                  : LengthPercentage.partiallyResolve(Resolver.length(style))(
                      value,
                    ),
              ),
        ),
      ),
    );
  },
);
