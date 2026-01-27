import { Color, CSS4Color } from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

/**
 * @internal
 */
export type Specified = Color;

type Computed = Color.Canonical;

type Used = CSS4Color.Canonical;

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
