import { Keyword, type Length, type Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";
import type { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand";
import { LengthPercentage } from "./value/compound";

import type { Computed as FontSize } from "./font-size";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | LengthPercentage.LengthPercentage
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
  LengthPercentage.parse
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
      // We need the type assertion to help TS break a circular type reference:
      // this -> style.computed -> Longhands.Name -> Longhands.longhands -> this.
      const fontSize = style.computed("font-size").value as FontSize;

      return Selective.of(value)
        .if(
          LengthPercentage.isLengthPercentage,
          LengthPercentage.resolve(fontSize, style)
        )
        .get();
    })
);
