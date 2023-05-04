import { Keyword, Length, type Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { LengthPercentage } from "./value/compound";

const { either } = Parser;

/**
 * @internal
 */
export type Specified = Keyword<"auto"> | LengthPercentage.LengthPercentage;

/**
 * @internal
 */
export type Computed = Keyword<"auto"> | Length<"px"> | Percentage;

/**
 * @internal
 */
export const parse = either(Keyword.parse("auto"), LengthPercentage.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/top}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("auto"),
  parse,
  (top, style) =>
    top.map((top) => {
      switch (top.type) {
        case "keyword":
        // Percentages resolve relative to the height of the containing block,
        // which we do not handle
        case "percentage":
          return top;

        case "length":
        case "math expression":
          return LengthPercentage.resolve(Length.of(0, "px"), style)(top);
      }
    })
);
