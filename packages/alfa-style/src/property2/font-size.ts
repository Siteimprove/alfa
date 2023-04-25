import {
  Length,
  Keyword,
  Math,
  Percentage,
  Token,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | Length
  | Percentage
  | Math<"length-percentage">

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
export type Computed = Length<"px">;

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
  Percentage.parse,
  Length.parse,
  Math.parseLengthPercentage
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
export default Longhand.of<Specified, Computed>(
  Length.of(16, "px"),
  parse,
  (fontSize, style) =>
    fontSize.map((fontSize) => {
      const percentage = Resolver.percentage(
        style.parent.computed("font-size").value
      );
      const length = Resolver.length(style.parent);

      switch (fontSize.type) {
        case "math expression":
          return (
            fontSize
              .resolve({ length, percentage })
              // Since the calculation has been parsed and typed, there should
              // always be something to get.
              .getUnsafe()
          );

        case "length":
          return length(fontSize);

        case "percentage": {
          return percentage(fontSize);
        }

        case "keyword": {
          const parent = style.parent.computed("font-size").value;

          switch (fontSize.value) {
            case "larger":
              return parent.scale(1.2);

            case "smaller":
              return parent.scale(0.85);

            default: {
              const factor = factors[fontSize.value];

              const [family] = style.computed("font-family").value;

              const base =
                family.type === "keyword" ? bases[family.value] : bases.serif;

              return Length.of(factor * base, "px");
            }
          }
        }
      }
    }),
  {
    inherits: true,
  }
);
