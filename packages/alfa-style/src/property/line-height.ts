import { Keyword, Length, Percentage, Number } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

import * as FontSize from "./font-size";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    "line-height": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = Keyword<"normal"> | Number | Length | Percentage;

/**
 * @internal
 */
export type Computed = Keyword<"normal"> | Number | Length<"px">;

/**
 * @internal
 */
export const parse = either(
  Keyword.parse("normal"),
  either(Number.parse, either(Length.parse, Percentage.parse))
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
        switch (height.type) {
          case "keyword":
          case "number":
            return height;

          case "length":
            return Resolver.length(height, style);

          case "percentage": {
            const parent = style.parent.computed("font-size")
              .value as FontSize.Computed;

            return Length.of(parent.value * height.value, parent.unit);
          }
        }
      }),
    {
      inherits: true,
    }
  )
);
