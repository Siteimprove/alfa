import { Length } from "@siteimprove/alfa-css/src/value/numeric";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

/**
 * @internal
 */
export type Specified = Length;

/**
 * @internal
 */
export type Computed = Length.Fixed<"px">;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-offset}
 */
export default Longhand.of<Specified, Computed>(
  Length.of(0, "px"),
  Length.parse,
  (value, style) =>
    value.map((offset) => offset.resolve(Resolver.length(style)))
);
