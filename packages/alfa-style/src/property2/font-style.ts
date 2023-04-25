import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

declare module "../property" {
  interface Longhands {
    "font-style": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Keyword<"normal">
  | Keyword<"italic">
  | Keyword<"oblique">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("normal", "italic", "oblique");

/**
 * {@link https://drafts.csswg.org/css-fonts/#font-style-prop}
 */
export default Property.register(
  "font-style",
  Property.of<Specified, Computed>(
    Keyword.of("normal"),
    parse,
    (fontStyle) => fontStyle,
    {
      inherits: true,
    }
  )
);
