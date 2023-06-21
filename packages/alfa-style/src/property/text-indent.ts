import { Length, type Percentage } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";

import { LengthPercentage } from "./value/compound";

/**
 * @internal
 */
export type Specified = LengthPercentage.LengthPercentage;

/**
 * @internal
 */
export type Computed = Length.Canonical | Percentage.Canonical;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-indent}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Length.of(0, "px"),
  LengthPercentage.parse,
  (textIndent, style) =>
    textIndent.map((indent) =>
      // Percentages resolve relative to the width, which we do not really handle.
      indent.type === "percentage"
        ? indent
        : LengthPercentage.resolve(Length.of(0, "px"), style)(indent)
    ),
  {
    inherits: true,
  }
);
