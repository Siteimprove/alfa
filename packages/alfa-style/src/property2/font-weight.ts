import { Keyword, Number } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | Number

  // Absolute
  | Keyword<"normal">
  | Keyword<"bold">

  // Relative
  | Keyword<"bolder">
  | Keyword<"lighter">;

/**
 * @internal
 */
export type Computed = Number;

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
  Number.of(400),
  parse,
  (fontWeight, style) =>
    fontWeight.map((fontWeight) => {
      switch (fontWeight.type) {
        case "number":
          return fontWeight;

        case "keyword":
          switch (fontWeight.value) {
            case "normal":
              return Number.of(400);

            case "bold":
              return Number.of(700);

            // https://drafts.csswg.org/css-fonts/#relative-weights
            default: {
              const bolder = fontWeight.value === "bolder";

              const parent = style.parent.computed("font-weight")
                .value as Computed;

              if (parent.value < 100) {
                return Number.of(bolder ? 400 : parent.value);
              }

              if (parent.value < 350) {
                return Number.of(bolder ? 400 : 100);
              }

              if (parent.value < 550) {
                return Number.of(bolder ? 700 : 100);
              }

              if (parent.value < 750) {
                return Number.of(bolder ? 900 : 400);
              }

              if (parent.value < 900) {
                return Number.of(bolder ? 900 : 700);
              }

              return Number.of(bolder ? parent.value : 700);
            }
          }
      }
    }),
  {
    inherits: true,
  }
);
