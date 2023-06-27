import {
  Length,
  LengthPercentage,
  type Percentage,
} from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

/**
 * @internal
 */
export type Specified = LengthPercentage;

/**
 * @internal
 */
export type Computed =
  | LengthPercentage.Canonical
  // TODO: percentages resolve relative to the dimensions of the containing block,
  //       which we do not handle.
  //       This results in length-percentage calculations leaking to computed
  //       values, which is a bit annoying.
  | Percentage.Canonical
  | LengthPercentage.Calculated;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-indent}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Length.of(0, "px"),
  LengthPercentage.parse,
  (textIndent, style) =>
    textIndent.map(LengthPercentage.partiallyResolve(Resolver.length(style))),
  { inherits: true }
);
