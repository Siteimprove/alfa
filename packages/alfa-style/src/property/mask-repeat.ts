import { Keyword, List, type Parser as CSSParser } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";
import { matchLayers } from "./mask.js";

const { either } = Parser;

type RepeatStyle =
  | Keyword<"repeat-x">
  | Keyword<"repeat-y">
  | List<
      | Keyword<"repeat">
      | Keyword<"space">
      | Keyword<"round">
      | Keyword<"no-repeat">
    >;
const repeatStyle: CSSParser<RepeatStyle> = either(
  Keyword.parse("repeat-x", "repeat-y"),
  List.parseSpaceSeparated(
    Keyword.parse("repeat", "space", "round", "no-repeat"),
    1,
    2,
  ),
);

type Specified = List<RepeatStyle>;
type Computed = Specified;

/**
 * {@link https://drafts.fxtf.org/css-masking/#the-mask-repeat}
 *
 * @privateRemarks
 * The spec says that the computed value "Consists of: two keywords, one per dimension",
 * which could be taken to mean that the one-keyword shorthand values should be expanded to their two-keyword longhands,
 * e.g. `repeat-x` would be expanded to `repeat no-repeat` in the computed style,
 * but that is not the current behavior observed in the DevTools of Chrome and Firefox.
 * We mimic the behavior of the browsers and do not expand the shorthands.
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([List.of([Keyword.of("repeat")], " ")], ", "),
  List.parseCommaSeparated(repeatStyle),
  (value, style) => value.map((value) => matchLayers(value, style)),
);
