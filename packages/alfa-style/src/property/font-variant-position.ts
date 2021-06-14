import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

declare module "../property" {
  interface Longhands {
    "font-variant-position": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified = Keyword<"normal"> | Keyword<"sub"> | Keyword<"super">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("normal", "sub", "super");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-position}
 * @internal
 */
export default Property.register(
  "font-variant-position",
  Property.of<Specified, Computed>(
    Keyword.of("normal"),
    parse,
    (position) => position,
    { inherits: true }
  )
);
