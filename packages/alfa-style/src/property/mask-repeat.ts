import { Keyword, List, type Parser as CSSParser } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";

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
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([List.of([Keyword.of("repeat")])]),
  List.parseCommaSeparated(repeatStyle),
  (value) => value,
);
