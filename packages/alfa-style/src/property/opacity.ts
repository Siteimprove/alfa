import { Number, Percentage } from "@siteimprove/alfa-css";
import { Real } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

const { either } = Parser;

export type Opacity = Opacity.Specified | Opacity.Computed;

export namespace Opacity {
  export type Specified = Number | Percentage;

  export type Computed = Number;
}

/**
 * @see https://drafts.csswg.org/css-color/#propdef-opacity
 */
export const Opacity: Property<
  Opacity.Specified,
  Opacity.Computed
> = Property.of(
  Number.of(1),
  either(Number.parse, Percentage.parse),
  (style) =>
    style
      .substituted("opacity")
      .map((opacity) => Number.of(Real.clamp(opacity.value, 0, 1))),
  {
    inherits: true,
  }
);
