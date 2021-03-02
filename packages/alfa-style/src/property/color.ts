import { Color, Current, Percentage, RGB, System } from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";

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
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/color}
 * @internal
 */
export default Property.of<Specified, Computed>(
  Color.system("canvastext"),
  parse,
  (value) => value.map((color) => Resolver.color(color)),
  {
    inherits: true,
  }
);
