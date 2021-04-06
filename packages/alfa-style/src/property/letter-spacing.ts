import { Keyword, Length } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    "letter-spacing": Property<Specified, Computed>;
  }
}

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
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing}
 * @internal
 */
export default Property.register(
  "letter-spacing",
  Property.of<Specified, Computed>(
    Length.of(0, "px"),
    parse,
    (value, style) =>
      value.map((spacing) => {
        switch (spacing.type) {
          case "keyword":
            return Length.of(0, "px");

          case "length":
            return Resolver.length(spacing, style);
        }
      }),
    {
      inherits: true,
    }
  )
);
