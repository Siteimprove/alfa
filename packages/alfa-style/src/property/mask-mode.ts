import { Keyword, List, type Parser as CSSParser } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";

type MaskingMode =
  | Keyword<"alpha">
  | Keyword<"luminance">
  | Keyword<"match-source">;
const maskingMode: CSSParser<MaskingMode> = Keyword.parse(
  "alpha",
  "luminance",
  "match-source",
);

type Specified = List<MaskingMode>;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-mode}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([Keyword.of("match-source")]),
  List.parseCommaSeparated(maskingMode),
  (value) => value,
);
