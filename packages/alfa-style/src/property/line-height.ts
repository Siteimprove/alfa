import {
  Keyword,
  Length,
  Percentage,
  Number,
  Calculation,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either, filter } = Parser;

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
  | Calculation<"length" | "percentage">;

/**
 * @internal
 */
export type Computed = Keyword<"normal"> | Number | Length<"px">;

/**
 * @internal
 */
export const parse = either(
  Keyword.parse("normal"),
  either(
    Number.parse,
    either(
      either(Length.parse, Percentage.parse),
      filter(
        Calculation.parse,
        (calculation) => calculation.isLengthPercentage(),
        () => `calc() expression must be of type "length" or "percentage"`
      )
    )
  )
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
            return height.resolve({
              length: lengthResolver,
              percentage: percentageResolver,
            });
        }
      }),
    {
      inherits: true,
    }
  )
);
