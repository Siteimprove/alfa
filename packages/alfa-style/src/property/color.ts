import { Color, Current, Percentage, RGB, System } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

/**
 * @internal
 */
export type Specified = Color;

/**
 * @internal
 */
export type Computed =
  | RGB<Percentage.Fixed, Percentage.Fixed>
  | Current
  | System;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/color}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Color.system("canvastext"),
  Color.parse,
  (value) => value.map((color) => Resolver.color(color)),
  {
    inherits: true,
  }
);
