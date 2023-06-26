import { Color, Keyword } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

type Specified = Color;

type Computed = Color.Canonical;

const parse = Color.parse;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("currentcolor"),
  parse,
  (textDecorationColor) => textDecorationColor.map(Resolver.color)
);
