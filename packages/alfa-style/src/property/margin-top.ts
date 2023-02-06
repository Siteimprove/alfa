import { Keyword, Length, Percentage, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    "margin-top": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = Keyword<"auto"> | Length | Percentage;

/**
 * @internal
 */
export type Computed = Keyword<"auto"> | Length<"px"> | Percentage;

/**
 * @internal
 */
export const parse = either<Slice<Token>, Specified, string>(
  Keyword.parse("auto"),
  Length.parse,
  Percentage.parse
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/margin-top}
 * @internal
 */
export default Property.register(
  "margin-top",
  Property.of<Specified, Computed>(
    Length.of(0, "px"),
    parse,
    (marginTop, style) =>
      marginTop.map((top) => {
        switch (top.type) {
          case "keyword":
          case "percentage":
            return top;

          case "length":
            return Resolver.length(top, style);
        }
      })
  )
);