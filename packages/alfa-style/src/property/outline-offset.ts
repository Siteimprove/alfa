import { Length } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

type Specified = Length;

type Computed = Length.Canonical;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-offset}
 */
export default Longhand.of<Specified, Computed>(
  Length.of(0, "px"),
  Length.parse,
  (value, style) =>
    value.map((offset) => offset.resolve(Resolver.length(style)))
);
