import { Length, LengthPercentage } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

type Specified = LengthPercentage;

type Computed = LengthPercentage.PartiallyResolved;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-indent}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Length.of(0, "px"),
  LengthPercentage.parse,
  (textIndent, style) =>
    textIndent.map(LengthPercentage.partiallyResolve(Resolver.length(style))),
  { inherits: true },
);
