import { Number, Percentage } from "@siteimprove/alfa-css";
import { clamp } from "@siteimprove/alfa-math";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

const { either } = Parser;

export type Opacity = Number | Percentage;

export namespace Opacity {
  export type Computed = Number;
}

/**
 * @see https://drafts.csswg.org/css-color/#propdef-opacity
 */
export const Opacity: Property<Opacity> = Property.of(
  Number.of(1),
  either(Number.parse, Percentage.parse),
  style =>
    style
      .specified("opacity")
      .map(opacity => Number.of(clamp(opacity.value, 0, 1))),
  {
    inherits: true
  }
);
