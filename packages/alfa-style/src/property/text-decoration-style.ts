import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

declare module "../property" {
  interface Longhands {
    "text-decoration-style": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Keyword<"solid">
  | Keyword<"double">
  | Keyword<"dotted">
  | Keyword<"dashed">
  | Keyword<"wavy">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "solid",
  "double",
  "dotted",
  "dashed",
  "wavy"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-style}
 * @internal
 */
export default Property.register(
  "text-decoration-style",
  Property.of<Specified, Computed>(
    Keyword.of("solid"),
    parse,
    (textDecorationStyle) => textDecorationStyle
  )
);
