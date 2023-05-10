import { Keyword, Number as CSSNumber } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";

import { Number } from "./value/compound";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | Number.Number

  // Absolute
  | Keyword<"normal">
  | Keyword<"bold">

  // Relative
  | Keyword<"bolder">
  | Keyword<"lighter">;

/**
 * @internal
 */
export type Computed = CSSNumber;

/**
 * @internal
 */
export const parse = either(
  Number.parse,
  Keyword.parse("normal", "bold", "bolder", "lighter")
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  CSSNumber.of(400),
  parse,
  (fontWeight, style) =>
    fontWeight.map((fontWeight) => {
      if (Number.isNumber(fontWeight)) {
        return Number.resolve(fontWeight);
      }

      switch (fontWeight.value) {
        case "normal":
          return CSSNumber.of(400);

        case "bold":
          return CSSNumber.of(700);

        // https://drafts.csswg.org/css-fonts/#relative-weights
        default: {
          const bolder = fontWeight.value === "bolder";

          const parent = style.parent.computed("font-weight").value as Computed;

          if (parent.value < 100) {
            return CSSNumber.of(bolder ? 400 : parent.value);
          }

          if (parent.value < 350) {
            return CSSNumber.of(bolder ? 400 : 100);
          }

          if (parent.value < 550) {
            return CSSNumber.of(bolder ? 700 : 100);
          }

          if (parent.value < 750) {
            return CSSNumber.of(bolder ? 900 : 400);
          }

          if (parent.value < 900) {
            return CSSNumber.of(bolder ? 900 : 700);
          }

          return CSSNumber.of(bolder ? parent.value : 700);
        }
      }
    }),
  {
    inherits: true,
  }
);
