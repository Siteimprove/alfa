import { Keyword, Length as CSSLength } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";

import { Length } from "./value/compound";
import type { Style } from "../style";
import type { Value } from "../value";

import type { Computed as StyleProp } from "./border-top-style";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | Length.Length
  | Keyword<"thin">
  | Keyword<"medium">
  | Keyword<"thick">;

/**
 * @internal
 */
export type Computed = CSSLength<"px">;

/**
 * @internal
 */
export const parse = either(
  Keyword.parse("thin", "medium", "thick"),
  Length.parse
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-width}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  CSSLength.of(3, "px"),
  parse,
  (borderWidth, style) => {
    const borderStyle = style.computed("border-top-style") as Value<StyleProp>;
    return compute(borderStyle, borderWidth, style);
  }
);

/**
 * @internal
 */
export function compute(
  styleProperty: Value<StyleProp>,
  specified: Value<Specified>,
  style: Style
): Value<Computed> {
  return specified.map((value) => {
    if (
      styleProperty.some(({ value }) => value === "none" || value === "hidden")
    ) {
      return CSSLength.of(0, "px");
    }

    if (Length.isLength(value)) {
      return Length.resolve(style)(value);
    }

    // Only keywords are left
    switch (value.value) {
      case "thin":
        return CSSLength.of(1, "px");

      case "medium":
        return CSSLength.of(3, "px");

      case "thick":
        return CSSLength.of(5, "px");
    }
  });
}
