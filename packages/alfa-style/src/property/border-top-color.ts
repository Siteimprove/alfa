import { Color } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.ts";
import { Resolver } from "../resolver.ts";

/**
 * @internal
 */
export type Specified = Color;

type Computed = Color.PartiallyResolved;

type Used = Color.Canonical;

/**
 * @remarks
 * This is used by the shorthand
 *
 * @internal
 */
export const parse = Color.parse;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-color}
 * @internal
 */
export default Longhand.of<Specified, Computed, Used>(
  Color.current,
  parse,
  (value) => value.map(Color.partiallyResolve),
  {
    use: (value, style) => value.map(Color.resolve(Resolver.color(style))),
  },
);
