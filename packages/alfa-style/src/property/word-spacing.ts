import { Keyword, Length } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

/**
 * @internal
 */
export type Specified = Keyword<"normal"> | Length;

/**
 * @internal
 */
export type Computed = Length<"px">;

/**
 * @internal
 */
export const parse = either(Keyword.parse("normal"), Length.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/word-spacing}
 * @internal
 */
export default Property.of<Specified, Computed>(
  Length.of(0, "px"),
  parse,
  (wordSpacing, style) =>
    wordSpacing.map((wordSpacing) => {
      switch (wordSpacing.type) {
        case "keyword":
          return Length.of(0, "px");

        case "length":
          return Resolver.length(wordSpacing, style);
      }
    }),
  {
    inherits: true,
  }
);
