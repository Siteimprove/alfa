import { Color } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";

type Specified = Color;

type Computed = Color.Canonical;

const parse = Color.parse;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Color.current,
  parse,
  (textDecorationColor) => textDecorationColor.map((color) => color.resolve()),
);
