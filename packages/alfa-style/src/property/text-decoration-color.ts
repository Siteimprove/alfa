import { Color } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

type Specified = Color;

type Computed = Color.PartiallyResolved;

type Used = Color.Canonical;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed, Used>(
  Color.current,
  Color.parse,
  (value) => value.map(Color.partiallyResolve),
  {
    use: (value, style) => value.map(Color.resolve(Resolver.color(style))),
  },
);
