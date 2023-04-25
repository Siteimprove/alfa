import { Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../foo-prop-class";

/**
 * @internal
 */
export type Specified =
  | Keyword<"start">
  | Keyword<"end">
  | Keyword<"left">
  | Keyword<"right">
  | Keyword<"center">
  | Keyword<"justify">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "start",
  "end",
  "left",
  "right",
  "center",
  "justify"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-align}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("start"),
  parse,
  (textAlign) => textAlign,
  {
    inherits: true,
  }
);
