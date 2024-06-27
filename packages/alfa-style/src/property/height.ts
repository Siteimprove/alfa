import { Keyword, LengthPercentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

type Specified = Keyword<"auto"> | LengthPercentage;

type Computed = Keyword<"auto"> | LengthPercentage.PartiallyResolved;

const parse = either(Keyword.parse("auto"), LengthPercentage.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/height}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("auto"),
  parse,
  (value, style) =>
    value.map((height) =>
      Selective.of(height)
        .if(
          LengthPercentage.isLengthPercentage,
          LengthPercentage.partiallyResolve(Resolver.length(style)),
        )
        .get(),
    ),
);
