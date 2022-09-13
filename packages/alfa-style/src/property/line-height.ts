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
        const percentage = Resolver.percentage(
          style.parent.computed("font-size").value
        );
        const length = Resolver.length(style);

        switch (height.type) {
          case "keyword":
          case "number":
            return height;

          case "length":
            return length(height);

          case "percentage":
            return percentage(height);

          case "calculation":
            return (
              height.isNumber()
                ? height.resolve({ percentage })
                : height.resolve({ length, percentage })
            ).get();
        }
      }),
    {
      inherits: true,
    }
  )
);
