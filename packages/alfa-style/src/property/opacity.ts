import { Number, Percentage } from "@siteimprove/alfa-css";
import { Real } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

const { either } = Parser;

/**
 * @internal
 */
export type Specified = Number | Percentage;

/**
 * @internal
 */
export type Computed = Number;

/**
 * @internal
 */
export const parse = either(Number.parse, Percentage.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/opacity}
 */
export default Property.of<Specified, Computed>(
  Number.of(1),
  parse,
  (value) => value.map((opacity) => Number.of(Real.clamp(opacity.value, 0, 1))),
  {
    inherits: true,
  }
);
