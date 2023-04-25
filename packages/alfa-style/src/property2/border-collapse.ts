import { Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../foo-prop-class";

/**
 * @internal
 */

export type Specified = Keyword<"collapse"> | Keyword<"separate">;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = Keyword.parse("collapse", "separate");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-collapse}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("separate"),
  parse,
  (borderCollapse) => borderCollapse,
  {
    inherits: true,
  }
);
