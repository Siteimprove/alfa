import {
  Keyword,
  Length,
  Math,
  Number,
  Percentage,
  Token,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../foo-prop-class";
import { Resolver } from "../resolver";

const { either } = Parser;

/**
 * @internal
 */
export type Specified =
  | Keyword<"normal">
  | Number
  | Length
  | Percentage
  | Math<"length-percentage">
  | Math<"number">;

/**
 * @internal
 */
export type Computed = Keyword<"normal"> | Number | Length<"px">;

/**
 * @internal
 */
export const parse = either<Slice<Token>, Specified, string>(
  Keyword.parse("normal"),
  Number.parse,
  Length.parse,
  Percentage.parse,
  Math.parseLengthNumberPercentage
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
      const percentage = Resolver.percentage(style.computed("font-size").value);
      const length = Resolver.length(style);

      switch (height.type) {
        case "keyword":
        case "number":
          return height;

        case "length":
          return length(height);

        case "percentage":
          return percentage(height);

        case "math expression":
          return (
            (
              height.isNumber()
                ? height.resolve({ percentage })
                : height.resolve({ length, percentage })
            )
              // Since the calculation has been parsed and typed, there should
              // always be something to get.
              .getUnsafe()
          );
      }
    }),
  {
    inherits: true,
  }
);
