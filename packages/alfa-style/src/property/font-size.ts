import {
  Keyword,
  Length,
  Percentage,
  Calculation,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

import * as Family from "./font-family";

const { either, filter } = Parser;

/**
 * @internal
 */
export type Specified =
  | Length
  | Percentage
  | Calculation

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
export const parse = either(
  either(
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
    Keyword.parse("larger", "smaller")
  ),
  either(
    either(Percentage.parse, Length.parse),
    filter(
      Calculation.parse,
      ({ expression: { kind } }) =>
        kind.is("length", 1, true) || kind.is("percentage"),
      () => `calc() expression must be of type "length" or "percentage"`
    )
  )
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
 * @see https://drafts.csswg.org/css-fonts/#absolute-size-mapping
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
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
 */
export default Property.of<Specified, Computed>(
  Length.of(16, "px"),
  parse,
  (fontSize, style) =>
    fontSize.map((fontSize) => {
      if (fontSize.type === "calculation") {
        const { expression } = fontSize.reduce((value) => {
          if (Length.isLength(value)) {
            return Resolver.length(value, style.parent);
          }

          if (Percentage.isPercentage(value)) {
            const parent = style.parent.computed("font-size").value as Computed;

            return Length.of(parent.value * value.value, parent.unit);
          }

          return value;
        });

        fontSize = expression.toLength().or(expression.toPercentage()).get();
      }

      switch (fontSize.type) {
        case "length":
          return Resolver.length(fontSize, style.parent);

        case "percentage": {
          const parent = style.parent.computed("font-size").value as Computed;

          return Length.of(parent.value * fontSize.value, parent.unit);
        }

        case "keyword": {
          const parent = style.parent.computed("font-size").value as Computed;

          switch (fontSize.value) {
            case "larger":
              return Length.of(parent.value * 1.2, parent.unit);

            case "smaller":
              return Length.of(parent.value * 0.85, parent.unit);

            default: {
              const factor = factors[fontSize.value];

              const [family] = style.computed("font-family")
                .value as Family.Computed;

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
