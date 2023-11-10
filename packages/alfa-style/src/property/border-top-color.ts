import { Color } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";

/**
 * @internal
 */
export type Specified = Color;

type Computed = Color.Canonical;

/**
 * @internal
 */
export const parse = Color.parse;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-color}
 * @internal
 */
export default Longhand.of<Specified, Computed>(Color.current, parse, (value) =>
  value.map((color) => color.resolve()),
);
