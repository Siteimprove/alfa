import { Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";

/**
 * @internal
 */
export type Specified =
  | Keyword<"normal">
  | Keyword<"small-caps">
  | Keyword<"all-small-caps">
  | Keyword<"petite-caps">
  | Keyword<"all-petite-caps">
  | Keyword<"unicase">
  | Keyword<"titling-caps">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "normal",
  "small-caps",
  "all-small-caps",
  "petite-caps",
  "all-petite-caps",
  "unicase",
  "titling-caps"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-caps}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("normal"),
  parse,
  (position) => position,
  { inherits: true }
);
