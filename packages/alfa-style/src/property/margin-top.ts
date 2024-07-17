import type { Token } from "@siteimprove/alfa-css";
import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

type Specified = Keyword<"auto"> | Length | Percentage;

type Computed = Keyword<"auto"> | Length.Canonical | Percentage;

/**
 * @internal
 */
export const parse = either<Slice<Token>, Specified, string>(
  Keyword.parse("auto"),
  Length.parse,
  Percentage.parse,
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/margin-top}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Length.of(0, "px"),
  parse,
  (marginTop, style) =>
    marginTop.map((top) => {
      switch (top.type) {
        case "keyword":
        case "percentage":
          return top;

        case "length":
          return top.resolve(Resolver.length(style));
      }
    }),
);
