import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    "min-height": Property<Specified, Computed>;
  }
}
/**
 * @internal
 */
export type Specified =
  | Keyword<"auto">
  // The `fit-content(value)` syntax has poor support currently
  | Keyword<"fit-content">
  | Keyword<"max-content">
  | Keyword<"min-content">
  | Length
  | Percentage;

/**
 * @internal
 */
export type Computed =
  | Keyword<"auto">
  | Keyword<"fit-content">
  | Keyword<"max-content">
  | Keyword<"min-content">
  | Length<"px">
  | Percentage;

/**
 * @internal
 */
export const parse = either(
  Keyword.parse("auto", "fit-content", "max-content", "min-content"),
  either(Length.parse, Percentage.parse)
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/min-height}
 * @internal
 */
export default Property.register(
  "min-height",
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
