import { Length } from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";

/**
 * @internal
 */
export type Specified = Length;

/**
 * @internal
 */
export type Computed = Length<"px">;

/**
 * @internal
 */
export const parse = Length.parse;

/**
 * @see https://drafts.csswg.org/css-ui/#outline-offset
 */
export default Property.of<Specified, Computed>(
  Length.of(0, "px"),
  parse,
  (outlineOffset, style) =>
    outlineOffset.map((offset) => Resolver.length(offset, style))
);
