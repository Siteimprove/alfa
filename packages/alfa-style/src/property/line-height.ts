import {
  Calculation,
  Keyword,
  Length,
  Number,
  Percentage,
  Token,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    "line-height": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Keyword<"normal">
  | Number
  | Length
  | Percentage
  | Calculation<"length-percentage">
  | Calculation<"number">;

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
  Calculation.parseLengthNumberPercentage
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/line-height}
 * @internal
 */
export default Property.register(
  "line-height",
  Property.of<Specified, Computed>(
    Keyword.of("normal"),
    parse,
    (value, style) =>
      value.map((height) => {
        const percentageResolver = Resolver.percentage(
          style.parent.computed("font-size").value
        );
        const lengthResolver = Resolver.length(style);

        switch (height.type) {
          case "keyword":
          case "number":
            return height;

          case "length":
            return lengthResolver(height);

          case "percentage":
            return percentageResolver(height);

          case "calculation":
            // TS can't see that the union is exactly covered by the overloads
            // so we have to do this ugly split :-/
            return (
              height.isNumber()
                ? height.resolve({
                    length: lengthResolver,
                    percentage: percentageResolver,
                  })
                : height.resolve({
                    length: lengthResolver,
                    percentage: percentageResolver,
                  })
            ).get();
        }
      }),
    {
      inherits: true,
    }
  )
);
