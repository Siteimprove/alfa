import {
  Keyword,
  LengthPercentage,
  List,
  type Parser as CSSParser,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

export type BgSize =
  | List<LengthPercentage | Keyword<"auto">>
  | Keyword<"cover">
  | Keyword<"contain">;

export namespace BgSize {
  export const parse: CSSParser<BgSize> = either(
    List.parseSpaceSeparated(
      either(LengthPercentage.parse, Keyword.parse("auto")),
      1,
      2,
    ),
    Keyword.parse("cover", "contain"),
  );
  export const initialItem = List.of([Keyword.of("auto")], " ");
}

type Specified = List<BgSize>;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-size}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([BgSize.initialItem], ", "),
  List.parseCommaSeparated(BgSize.parse),
  (value, style) => {
    const layers = Resolver.layers<BgSize>(style, "mask-image");

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
