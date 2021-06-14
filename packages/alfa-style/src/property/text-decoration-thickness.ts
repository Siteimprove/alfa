import { Keyword, Length, Percentage, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    "text-decoration-thickness": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Length
  | Percentage
  | Keyword<"auto">
  | Keyword<"from-font">;

/**
 * @internal
 */
export type Computed = Length<"px"> | Keyword<"auto"> | Keyword<"from-font">;

/**
 * @internal
 */
export const parse = either<Slice<Token>, Specified, string>(
  Keyword.parse("auto", "from-font"),
  Length.parse,
  Percentage.parse
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-thickness}
 * @internal
 */
export default Property.register(
  "text-decoration-thickness",
  Property.of<Specified, Computed>(
    Keyword.of("auto"),
    parse,
    (thickness, style) =>
      thickness.map((value) => {
        switch (value.type) {
          case "keyword":
            return value;
          case "length":
            return Resolver.length(value, style);
          case "percentage":
            return Length.of(
              style.computed("font-size").value.value * value.value,
              "px"
            );
        }
      })
  )
);
