import { Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";

/**
 * @internal
 */
export type Specified =
  | Keyword<"row">
  | Keyword<"row-reverse">
  | Keyword<"column">
  | Keyword<"column-reverse">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "row",
  "row-reverse",
  "column",
  "column-reverse"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("row"),
  parse,
  (position) => position
);
