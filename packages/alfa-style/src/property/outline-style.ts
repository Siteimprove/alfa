import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

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
 * {@link https://drafts.csswg.org/css-ui/#outline-style}
 * @internal
 */
export default Property.of<Specified, Computed>(
  Keyword.of("none"),
  parse,
  (outlineStyle) => outlineStyle
);
