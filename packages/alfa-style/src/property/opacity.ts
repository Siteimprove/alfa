import { Number, Percentage } from "@siteimprove/alfa-css";
import { Real } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";

const { either } = Parser;

/**
 * @internal
 */
export type Specified = Number | Percentage;

/**
 * @internal
 */
export type Computed = Number.Canonical;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/opacity}
 */
export default Longhand.of<Specified, Computed>(
  Number.of(1),
  either(Number.parse, Percentage.parse),
  (value) =>
    value.map((opacity) =>
      Number.of(Real.clamp(opacity.resolve().value, 0, 1))
    ),
  { inherits: true }
);
