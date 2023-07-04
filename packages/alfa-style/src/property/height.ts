import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { either } = Parser;

type Specified = Keyword<"auto"> | Length | Percentage;

type Computed = Keyword<"auto"> | Length.Canonical | Percentage.Canonical;

const parse = either(
  Keyword.parse("auto"),
  either(Length.parse, Percentage.parse)
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/height}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("auto"),
  parse,
  (value, style) =>
    value.map((height) => {
      switch (height.type) {
        case "keyword":
          return height;
        case "percentage":
          return height.resolve();

        case "length":
          return height.resolve(Resolver.length(style));
      }
    })
);
