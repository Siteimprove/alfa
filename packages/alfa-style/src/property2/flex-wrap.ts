import { Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";

/**
 * @internal
 */
export type Specified =
  | Keyword<"nowrap">
  | Keyword<"wrap">
  | Keyword<"wrap-reverse">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("nowrap", "wrap", "wrap-reverse");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("nowrap"),
  parse,
  (position) => position
);
