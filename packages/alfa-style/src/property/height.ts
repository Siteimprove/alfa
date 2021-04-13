import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    height: Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = Keyword<"auto"> | Length | Percentage;

/**
 * @internal
 */
export type Computed = Keyword<"auto"> | Length<"px"> | Percentage;

/**
 * @internal
 */
export const parse = either(
  Keyword.parse("auto"),
  either(Length.parse, Percentage.parse)
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/height}
 * @internal
 */
export default Property.register(
  "height",
  Property.of<Specified, Computed>(Keyword.of("auto"), parse, (value, style) =>
    value.map((height) => {
      switch (height.type) {
        case "keyword":
        case "percentage":
          return height;

        case "length":
          return Resolver.length(height, style);
      }
    })
  )
);
