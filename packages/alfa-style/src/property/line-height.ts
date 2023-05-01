import {
  Keyword,
  Length,
  Number as CSSNumber,
  type Token,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";
import { LengthPercentage, Number } from "./value/compound";

import type { Computed as FontSize } from "./font-size";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | Keyword<"normal">
  | LengthPercentage.LengthPercentage
  | Number.Number;

/**
 * @internal
 */
export type Computed = Keyword<"normal"> | CSSNumber | Length<"px">;

/**
 * @internal
 */
export const parse = either<Slice<Token>, Specified, string>(
  Keyword.parse("normal"),
  Number.parse,
  LengthPercentage.parse
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/line-height}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("normal"),
  parse,
  (value, style) =>
    value.map((height) => {
      // We need the type assertion to help TS break a circular type reference:
      // this -> style.computed -> Longhands.Name -> Longhands.longhands -> this.
      const fontSize = style.computed("font-size").value as FontSize;

      if (LengthPercentage.isLengthPercentage(height)) {
        return LengthPercentage.resolve(height, fontSize, style);
      }

      if (Number.isNumber(height)) {
        return Number.resolve(height);
      }

      return height;
    }),
  {
    inherits: true,
  }
);
