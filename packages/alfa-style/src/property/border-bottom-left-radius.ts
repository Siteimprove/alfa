import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";

const { pair } = Parser;

/**
 * @internal
 */

export type Specified = [Length<"px"> | Percentage, Length<"px"> | Percentage];

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = pair();

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-block-start-style
 * @internal
 */
export default Property.of<Specified, Computed>(
  Keyword.of("none"),
  parse,
  (blockStyle) => blockStyle
);
