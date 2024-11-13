import { Parser } from "@siteimprove/alfa-parser";
import {
  CustomIdent,
  Keyword,
  List,
  type Parser as CSSParser,
} from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";

const { either } = Parser;

type Specified =
  | Keyword<"auto">
  | List<Keyword<"scroll-position"> | Keyword<"contents"> | CustomIdent>;
type Computed = Specified;

const illegalCustomIdents = [
  "will-change",
  "auto",
  "scroll-position",
  "contents",
];

const animatableFeature: CSSParser<
  Keyword<"scroll-position"> | Keyword<"contents"> | CustomIdent
> = either(
  Keyword.parse("scroll-position", "contents"),
  CustomIdent.parse(
    (customIdent) => !illegalCustomIdents.includes(customIdent.value),
  ),
);

const parse = either(
  Keyword.parse("auto"),
  List.parseCommaSeparated(animatableFeature),
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/will-change}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("auto"),
  parse,
  (value) => value,
);
