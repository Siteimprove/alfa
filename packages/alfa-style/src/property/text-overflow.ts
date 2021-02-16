import { Keyword } from "@siteimprove/alfa-css";

import { Property } from "../property";

/**
 * @internal
 */
export type Specified = Keyword<"clip"> | Keyword<"ellipsis">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("clip", "ellipsis");

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow
 * @internal
 */
export default Property.of<Specified, Computed>(
  Keyword.of("clip"),
  parse,
  (textOverflow) => textOverflow
);
