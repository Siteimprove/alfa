import { Number } from "@siteimprove/alfa-css";
import { Real } from "@siteimprove/alfa-math";

import { Longhand } from "../longhand";
import { NumberPercentage } from "./value/compound";

/**
 * @internal
 */
export type Specified = NumberPercentage.NumberPercentage;

/**
 * @internal
 */
export type Computed = Number.Fixed;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/opacity}
 */
export default Longhand.of<Specified, Computed>(
  Number.of(1),
  NumberPercentage.parse,
  (value) =>
    value.map((opacity) =>
      Number.of(Real.clamp(NumberPercentage.resolve(opacity).value, 0, 1))
    ),
  {
    inherits: true,
  }
);
