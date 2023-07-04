import { Color, Percentage } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

/**
 * @internal
 */
export type Specified = Color;

type Computed = Color.Canonical;

/**
 * @internal
 */
export const parse = Color.parse;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-color}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Color.rgb(
    Percentage.of(0),
    Percentage.of(0),
    Percentage.of(0),
    Percentage.of(0)
  ),
  parse,
  (value) => value.map((color) => Resolver.color(color))
);
