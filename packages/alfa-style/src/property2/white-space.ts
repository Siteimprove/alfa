import { Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../foo-prop-class";

/**
 * @internal
 */
export type Specified =
  | Keyword<"normal">
  | Keyword<"pre">
  | Keyword<"nowrap">
  | Keyword<"pre-wrap">
  | Keyword<"break-spaces">
  | Keyword<"pre-line">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "normal",
  "pre",
  "nowrap",
  "pre-wrap",
  "break-spaces",
  "pre-line"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/white-space}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("normal"),
  parse,
  (whiteSpace) => whiteSpace,
  {
    inherits: true,
  }
);
