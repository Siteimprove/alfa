import {
  Color,
  Current,
  Keyword,
  Percentage,
  RGB,
  System,
} from "@siteimprove/alfa-css";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

/**
 * @internal
 */
export type Specified = Color;

/**
 * @internal
 */
export type Computed = RGB<Percentage, Percentage> | Current | System;

/**
 * @internal
 */
export const parse = Color.parse;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration-color}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("currentcolor"),
  parse,
  (textDecorationColor) => textDecorationColor.map(Resolver.color)
);
