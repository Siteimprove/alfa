import { Color, Percentage } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

/**
 * @internal
 */
export type Specified = Color;

type Computed = Color.Canonical;

/**
 * @remarks
 * This is used by the shorthand parser for background.
 *
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
    Percentage.of(0),
  ),
  parse,
  (value, style) => value.resolve(Resolver.length(style)),
);
