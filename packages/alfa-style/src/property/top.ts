import { Keyword, LengthPercentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { either } = Parser;

/**
 * @internal
 */
export type Specified = Keyword<"auto"> | LengthPercentage;

/**
 * @internal
 *
 * @remarks
 * TODO: percentages resolve relative to the dimensions of the containing block,
 *       which we do not handle.
 *       This results in length-percentage calculations leaking to computed
 *       values, which is a bit annoying.
 */
export type Computed = Keyword<"auto"> | LengthPercentage.PartiallyResolved;

/**
 * @internal
 */
export const parse = either(Keyword.parse("auto"), LengthPercentage.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/top}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("auto"),
  parse,
  (top, style) =>
    top.map((top) =>
      Selective.of(top)
        .if(Keyword.isKeyword, (top) => top)
        .else(LengthPercentage.partiallyResolve(Resolver.length(style)))
        .get()
    )
);
