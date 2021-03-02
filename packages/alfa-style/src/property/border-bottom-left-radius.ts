import { Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Resolver } from "../resolver";

import { Property } from "../property";

const { takeBetween, either, map } = Parser;

/**
 * @internal
 */

export type Specified = [
  horizontal: Length | Percentage,
  vertical: Length | Percentage
];

/**
 * @internal
 */
export type Computed = [
  horizontal: Length<"px"> | Percentage,
  vertical: Length<"px"> | Percentage
];

/**
 * @internal
 */
export const parse = map(
  takeBetween(either(Length.parse, Percentage.parse), 1, 2),
  // TODO
  ([horizontal, vertical] = horizontal) => [horizontal, vertical] as const
);

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-left-radius
 * @internal
 */
export default Property.of<Specified, Computed>(
  [Length.of(0, "px"), Length.of(0, "px")],
  // TODO
  parse,
  (leftRadius, style) => {
    leftRadius.value.map((value) => {
      switch (value.type) {
        case "length":
          return Resolver.length(value, style);
        default:
          return value;
      }
    });
  }
);
