import { Color } from "@siteimprove/alfa-css";
import { Option } from "@siteimprove/alfa-option";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

type Specified = Color;

type Computed = Color.Canonical;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Color.current,
  Color.parse,
  (value) => value.map(Color.partiallyResolve),
  {
    use: (value, style) =>
      Option.of(value.map(Color.resolve(Resolver.color(style)))),
  },
);
