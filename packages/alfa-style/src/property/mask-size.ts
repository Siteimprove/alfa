import {
  Keyword,
  LengthPercentage,
  List,
  type Parser as CSSParser,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";
import { matchLayers } from "./mask.js";

const { either } = Parser;

type BgSize =
  | List<LengthPercentage | Keyword<"auto">>
  | Keyword<"cover">
  | Keyword<"contain">;

const bgSize: CSSParser<BgSize> = either(
  List.parseSpaceSeparated(
    either(LengthPercentage.parse, Keyword.parse("auto")),
    1,
    2,
  ),
  Keyword.parse("cover", "contain"),
);

type Specified = List<BgSize>;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-size}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([List.of([Keyword.of("auto")], " ")], ", "),
  List.parseCommaSeparated(bgSize),
  (value, style) =>
    value.map((sizes) =>
      matchLayers(
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
        style,
      ),
    ),
);
