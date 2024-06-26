import { Keyword, Length } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

type Specified = Keyword<"normal"> | Length;

type Computed = Length.Canonical;

const parse = either(Keyword.parse("normal"), Length.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/word-spacing}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Length.of(0, "px"),
  parse,
  (value, style) =>
    value
      .resolve(Resolver.length(style))
      .map((wordSpacing) =>
        Keyword.isKeyword(wordSpacing) ? Length.of(0, "px") : wordSpacing,
      ),
  {
    inherits: true,
  },
);
