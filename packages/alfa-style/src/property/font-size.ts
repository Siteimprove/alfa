import { Length, Keyword, type Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";

import { LengthPercentage } from "./value/compound";
import { Longhand } from "../longhand";

import type { Computed as FontFamily } from "./font-family";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | LengthPercentage.LengthPercentage

  // Absolute
  | Keyword<"xx-small">
  | Keyword<"x-small">
  | Keyword<"small">
  | Keyword<"medium">
  | Keyword<"large">
  | Keyword<"x-large">
  | Keyword<"xx-large">
  | Keyword<"xxx-large">

  // Relative
  | Keyword<"larger">
  | Keyword<"smaller">;

/**
 * @internal
 */
export type Computed = Length.Fixed<"px">;

/**
 * @internal
 */
export const parse = either<Slice<Token>, Specified, string>(
  Keyword.parse(
    "xx-small",
    "x-small",
    "small",
    "medium",
    "large",
    "x-large",
    "xx-large",
    "xxx-large"
  ),
  Keyword.parse("larger", "smaller"),
  LengthPercentage.parse
);

/**
 * Base font sizes for generic font families. In browsers, these sizes depend on
 * a number of things, such as language and user configuration, but for
 * simplicity we assume a single base size for every generic font family.
 */
const bases = {
  serif: 16,
  "sans-serif": 16,
  monospace: 13,
  cursive: 16,
  fantasy: 16,
} as const;

/**
 * Scaling factors for absolute font sizes. In browsers, these factors are only
 * used when the base font size are outside the range of 9 to 16 pixels. Within
 * this range, a hardcoded lookup table is used for various legacy reasons but
 * for simplicity we always rely on these scaling factors. The effect of this is
 * that we will compute font sizes that are slightly larger than what browsers
 * would render.
 *
 * {@link https://drafts.csswg.org/css-fonts/#absolute-size-mapping}
 */
const factors = {
  "xx-small": 3 / 5,
  "x-small": 3 / 4,
  small: 8 / 9,
  medium: 1,
  large: 6 / 5,
  "x-large": 3 / 2,
  "xx-large": 2 / 1,
  "xxx-large": 3 / 1,
} as const;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-size}
 * @internal
 */
// We need a type hint to help TS break the circular type reference.
// this -> style.computed -> Longhands.Name -> Longhands.longhands -> this.
// This one depends on itself (same property), so we also need the type
// hint on the property itself
const property: Longhand<Specified, Computed> = Longhand.of<
  Specified,
  Computed
>(
  Length.of(16, "px"),
  parse,
  (fontSize, style) =>
    fontSize.map((fontSize) => {
      // We need the type assertion to help TS break a circular type reference:
      // this -> style.computed -> Longhands.Name -> Longhands.longhands -> this.
      const parent = style.parent.computed("font-size").value as Computed;

      if (LengthPercentage.isLengthPercentage(fontSize)) {
        return LengthPercentage.resolve(parent, style.parent)(fontSize);
      }

      // Must be a keyword
      switch (fontSize.value) {
        case "larger":
          return parent.scale(1.2);

        case "smaller":
          return parent.scale(0.85);

        default: {
          const factor = factors[fontSize.value];

          // We need the type assertion to help TS break a circular type reference:
          // this -> style.computed -> Longhands.Name -> Longhands.longhands -> this.
          const [family] = (style.computed("font-family").value as FontFamily)
            .values;

          const base =
            family.type === "keyword" ? bases[family.value] : bases.serif;

          return Length.of(factor * base, "px");
        }
      }
    }),
  {
    inherits: true,
  }
);

export default property;
