import { Length } from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";

declare module "../property" {
  interface Longhands {
    "outline-offset": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = Length;

/**
 * @internal
 */
export type Computed = Length<"px">;

/**
 * @internal
 */
export const parse = Length.parse;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-offset}
 */
export default Property.register(
  "outline-offset",
  Property.of<Specified, Computed>(
    Length.of(0, "px"),
    parse,
    (outlineOffset, style) =>
      outlineOffset.map((offset) => Resolver.length(offset, style))
  )
);
