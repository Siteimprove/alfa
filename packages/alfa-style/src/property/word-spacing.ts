import { Keyword } from "@siteimprove/alfa-css";
import { Length } from "@siteimprove/alfa-css/src/value/numeric";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { either } = Parser;

/**
 * @internal
 */
export type Specified = Keyword<"normal"> | Length;

/**
 * @internal
 */
export type Computed = Length.Canonical;

/**
 * @internal
 */
export const parse = either(Keyword.parse("normal"), Length.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/word-spacing}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Length.of(0, "px"),
  parse,
  (wordSpacing, style) =>
    wordSpacing.map((wordSpacing) =>
      Selective.of(wordSpacing)
        .if(Length.isLength, (spacing) =>
          spacing.resolve(Resolver.length(style))
        )
        .else(() => Length.of(0, "px"))
        .get()
    ),
  {
    inherits: true,
  }
);
