import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { either } = Parser;

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
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/inset-block-start
 * @internal
 */
export default Property.of<Specified, Computed>(
  Keyword.of("auto"),
  parse,
  (insetBlockStart, style) =>
    insetBlockStart.map((insetBlockStart) => {
      switch (insetBlockStart.type) {
        case "keyword":
        case "percentage":
          return insetBlockStart;

        case "length":
          return Resolver.length(insetBlockStart, style);
      }
    })
);
