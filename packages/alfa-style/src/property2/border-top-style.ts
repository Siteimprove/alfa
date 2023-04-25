import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

declare module "../property" {
  interface Longhands {
    "border-top-style": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */

export type Specified =
  | Keyword<"none">
  | Keyword<"hidden">
  | Keyword<"dotted">
  | Keyword<"dashed">
  | Keyword<"solid">
  | Keyword<"double">
  | Keyword<"groove">
  | Keyword<"ridge">
  | Keyword<"inset">
  | Keyword<"outset">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "none",
  "hidden",
  "dotted",
  "dashed",
  "solid",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-style}
 * @internal
 */
export default Property.register(
  "border-top-style",
  Property.of<Specified, Computed>(
    Keyword.of("none"),
    parse,
    (borderStyle) => borderStyle
  )
);
