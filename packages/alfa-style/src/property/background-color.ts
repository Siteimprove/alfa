import { Current, Color, Percentage, RGB, System } from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";

declare module "../property" {
  interface Longhands {
    "background-color": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = Color;

/**
 * @internal
 */
export type Computed = RGB<Percentage, Percentage> | Current | System;

/**
 * @internal
 */
export const parse = Color.parse;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-color}
 * @internal
 */
export default Property.register(
  "background-color",
  Property.of<Specified, Computed>(
    Color.rgb(
      Percentage.of(0),
      Percentage.of(0),
      Percentage.of(0),
      Percentage.of(0)
    ),
    parse,
    (value) => value.map((color) => Resolver.color(color))
  )
);
