import { Calculation, Keyword, Length, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";
import { Resolver } from "../resolver";
import { Value } from "../value";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    "outline-width": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Length
  | Calculation<"length">
  | Keyword<"thin">
  | Keyword<"medium">
  | Keyword<"thick">;

/**
 * @internal
 */
export type Computed = Length<"px">;

/**
 * @internal
 */
export const parse = either<Slice<Token>, Specified, string>(
  Keyword.parse("thin", "medium", "thick"),
  Length.parse,
  Calculation.parseLength
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-width}
 * @internal
 */
export default Property.register(
  "outline-width",
  Property.of<Specified, Computed>(
    Length.of(3, "px"),
    parse,
    (value, style) => {
      if (
        style.computed("outline-style").some(({ value }) => value === "none")
      ) {
        return Value.of(Length.of(0, "px"));
      }

      return value.map((width) => {
        const length = Resolver.length(style);

        switch (width.type) {
          case "length":
            return length(width);

          case "calculation":
            return width.resolve({ length }).get();

          case "keyword":
            switch (width.value) {
              case "thin":
                return Length.of(1, "px");

              case "medium":
                return Length.of(3, "px");

              case "thick":
                return Length.of(5, "px");
            }
        }
      });
    }
  )
);
