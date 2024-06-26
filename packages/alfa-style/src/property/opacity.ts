import { Number, Percentage } from "@siteimprove/alfa-css";
import { Real } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";

const { either } = Parser;

type Specified = Number | Percentage<"percentage">;

type Computed = Number.Canonical;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/opacity}
 */
export default Longhand.of<Specified, Computed>(
  Number.of(1),
  either(Number.parse, Percentage.parse<"percentage">),
  (value) =>
    value.map((opacity) =>
      Number.of(Real.clamp(opacity.resolve().value, 0, 1)),
    ),
  { inherits: true },
);
