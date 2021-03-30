import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

declare module "../property" {
  interface Longhands {
    "outline-style": Property<Specified, Computed>;
  }
}

/**
 * @internal
 */
export type Specified =
  | Keyword<"auto">
  | Keyword<"none">
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
  "auto",
  "none",
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
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/outline-style}
 * @internal
 */
export default Property.register(
  "outline-style",
  Property.of<Specified, Computed>(
    Keyword.of("none"),
    parse,
    (outlineStyle) => outlineStyle
  )
);
