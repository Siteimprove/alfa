import { Parser } from "@siteimprove/alfa-parser";
import {
  Image,
  Keyword,
  List,
  URL,
  type Parser as CSSParser,
} from "@siteimprove/alfa-css";

const { either } = Parser;

import { Longhand } from "../longhand.js";

type MaskReference = Keyword<"none"> | Image | URL;
const maskReference: CSSParser<MaskReference> = either(
  Keyword.parse("none"),
  either(Image.parse, URL.parse),
);

type Specified = List<MaskReference>;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([Keyword.of("none")]),
  List.parseCommaSeparated(maskReference),
  (value) => value, // TODO: as specified, but with <url> values made absolute
);
