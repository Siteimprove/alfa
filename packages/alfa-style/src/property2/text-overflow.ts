import { Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../foo-prop-class";

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
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("clip"),
  parse,
  (textOverflow) => textOverflow
);
