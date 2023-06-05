import { Keyword } from "@siteimprove/alfa-css";
import { Length } from "@siteimprove/alfa-css/src/value/numeric";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";

import type { Style } from "../style";
import type { Value } from "../value";

import type { Computed as StyleProp } from "./border-top-style";
import { Resolver } from "../resolver";

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
export type Computed = Length.Fixed<"px">;

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
  Length.of(3, "px"),
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
      return Length.of(0, "px");
    }

    if (Length.isLength(value)) {
      return value.resolve(Resolver.length(style));
    }

    // Only keywords are left
    switch (value.value) {
      case "thin":
        return Length.of(1, "px");

      case "medium":
        return Length.of(3, "px");

      case "thick":
        return Length.of(5, "px");
    }
  });
}
