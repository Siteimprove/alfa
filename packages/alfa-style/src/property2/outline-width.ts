import { Keyword, Length, Math, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../foo-prop-class";
import { Resolver } from "../resolver";
import { Value } from "../value";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | Length
  | Math<"length">
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
  Math.parseLength
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-width}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Length.of(3, "px"),
  parse,
  (value, style) => {
    if (style.computed("outline-style").some(({ value }) => value === "none")) {
      return Value.of(Length.of(0, "px"));
    }

    return value.map((width) => {
      const length = Resolver.length(style);

      switch (width.type) {
        case "length":
          return length(width);

        case "math expression":
          return (
            width
              .resolve({ length })
              // Since the calculation has been parsed and typed, there should
              // always be something to get.
              .getUnsafe()
          );

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
);
