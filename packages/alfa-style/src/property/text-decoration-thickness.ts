import { Keyword, Length, Percentage, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

import type { Computed as FontSize } from "./font-size";

const { either } = Parser;

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
export default Longhand.of<Specified, Computed>(
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
          // We need the type assertion to help TS break a circular type reference:
          // this -> style.computed -> Longhands.Name -> Longhands.longhands -> this.
          const fontSize = style.computed("font-size").value as FontSize;

          return Length.of(fontSize.value * value.value, "px");
      }
    })
);
