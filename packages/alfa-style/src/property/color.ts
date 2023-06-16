import { Color } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

/**
 * @internal
 */
export type Specified = Color;

/**
 * @internal
 */
export type Computed = Color.Canonical;

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
