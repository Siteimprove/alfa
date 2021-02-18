import {
  Color,
  Current,
  Keyword,
  Percentage,
  RGB,
  System,
} from "@siteimprove/alfa-css";

import { Property } from "../property";
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
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-color
 * @internal
 */
export default Property.of<Specified, Computed>(
  Keyword.of("currentcolor"),
  parse,
  (value) => value.map((color) => Resolver.color(color))
);
