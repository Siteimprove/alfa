import { Keyword, Length } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

export namespace WordSpacing {
  export type Specified = Keyword<"normal"> | Length;

  export type Computed = Length<"px">;
}

/**
 * @see https://drafts.csswg.org/css-text-3/#word-spacing-property
 */
export const WordSpacing: Property<
  WordSpacing.Specified,
  WordSpacing.Computed
> = Property.of(
  // The real initial value is `normal`, which is not a computed value…
  // Replacing it with the computed value.
  Length.of(0, "px"),
  either(Keyword.parse("normal"), Length.parse),
  (style) =>
    style.specified("word-spacing").map((spacing) => {
      switch (spacing.type) {
        case "keyword":
          return Length.of(0, "px");

        case "length":
          return Resolver.length(spacing, style);
      }
    }),
  { inherits: true }
);
