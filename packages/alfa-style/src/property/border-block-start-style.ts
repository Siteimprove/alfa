import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

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
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start-style}
 * @internal
 */
export default Property.of<Specified, Computed>(
  Keyword.of("none"),
  parse,
  (blockStyle) => blockStyle
);
