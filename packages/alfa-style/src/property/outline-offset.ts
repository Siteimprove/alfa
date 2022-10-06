import { Calculation, Length } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

declare module "../property" {
  interface Longhands {
    "outline-offset": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = Length | Calculation<"length">;

/**
 * @internal
 */
export type Computed = Length<"px">;

/**
 * @internal
 */
export const parse = either(Length.parse, Calculation.parseLength);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-offset}
 */
export default Property.register(
  "outline-offset",
  Property.of<Specified, Computed>(Length.of(0, "px"), parse, (value, style) =>
    value.map((offset) => {
      const length = Resolver.length(style);

      switch (offset.type) {
        case "length":
          return length(offset);
        case "calculation":
          return (
            offset
              .resolve({ length })
              // Since the calculation has been parsed and typed, there should
              // always be something to get.
              .getUnsafe()
          );
      }
    })
  )
);
