import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

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
 * @see https://drafts.csswg.org/css-fonts/#font-style-prop
 */
export default Property.of<Specified, Computed>(
  Keyword.of("normal"),
  parse,
  (fontStyle) => fontStyle,
  {
    inherits: true,
  }
);
