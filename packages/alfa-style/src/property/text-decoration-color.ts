import { Color } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

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
  (value, style) => value.resolve(Resolver.length(style)),
);
