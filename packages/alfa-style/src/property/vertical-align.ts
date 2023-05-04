import { Keyword, Length, Number } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand";
import { LengthPercentage } from "./value/compound";

import type { Computed as FontSize } from "./font-size";
import type { Computed as LineHeight } from "./line-height";

const { either } = Parser;

type keywords =
  | Keyword<"baseline">
  | Keyword<"sub">
  | Keyword<"super">
  | Keyword<"text-top">
  | Keyword<"text-bottom">
  | Keyword<"middle">
  | Keyword<"top">
  | Keyword<"bottom">;

/**
 * @internal
 */
export type Specified = keywords | LengthPercentage.LengthPercentage;
/**
 * @internal
 */
export type Computed = keywords | Length<"px">;

/**
 * @internal
 */

export const parse = either(
  Keyword.parse(
    "baseline",
    "sub",
    "super",
    "text-top",
    "text-bottom",
    "middle",
    "top",
    "bottom"
  ),
  LengthPercentage.parse
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("baseline"),
  parse,
  (value, style) =>
    value.map((verticalAlign) => {
      // We need the type assertion to help TS break a circular type reference:
      // this -> style.computed -> Longhands.Name -> Longhands.longhands -> this.
      const lineHeight = style.computed("line-height").value as LineHeight;
      const fontSize = style.computed("font-size").value as FontSize;

      const base = Selective.of(lineHeight)
        .if(isNormal, () => fontSize.scale(1.2))
        .if(Number.isNumber, ({ value }) => fontSize.scale(value))
        .get();

      return Selective.of(verticalAlign)
        .if(
          LengthPercentage.isLengthPercentage,
          LengthPercentage.resolve(base, style)
        )
        .get();
    })
);

/**
 * isKeyword doesn't refine the type enough since it doesn't look at the value.
 */
function isNormal(value: unknown): value is Keyword<"normal"> {
  return Keyword.isKeyword(value) && value.value === "normal";
}
