import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

/**
 * @internal
 */
export type Specified =
  | Keyword<"static">
  | Keyword<"relative">
  | Keyword<"absolute">
  | Keyword<"sticky">
  | Keyword<"fixed">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse(
  "static",
  "relative",
  "absolute",
  "sticky",
  "fixed"
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/position}
 * @internal
 */
export default Property.of<Specified, Computed>(
  Keyword.of("static"),
  parse,
  (position) => position
);
