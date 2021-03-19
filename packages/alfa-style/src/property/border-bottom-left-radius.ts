import { Length, Percentage } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Property } from "../property";
import { Resolver } from "../resolver";

const { takeBetween, either, map } = Parser;

/**
 * @internal
 */
export type Specified = readonly [
  horizontal: Length | Percentage,
  vertical: Length | Percentage
];

/**
 * @internal
 */
export type Computed = readonly [
  horizontal: Length<"px"> | Percentage,
  vertical: Length<"px"> | Percentage
];

/**
 * @internal
 */
export const parse = map(
  takeBetween(either(Length.parse, Percentage.parse), 1, 2),
  ([horizontal, vertical = horizontal]) => [horizontal, vertical] as const
);

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-left-radius
 * @internal
 */
export default Property.of<Specified, Computed>(
  [Length.of(0, "px"), Length.of(0, "px")],
  parse,
  (value, style) =>
    value.map(([horizontal, vertical]) => {
      return [
        horizontal.type === "length"
          ? Resolver.length(horizontal, style)
          : horizontal,

        vertical.type === "length"
          ? Resolver.length(vertical, style)
          : vertical,
      ];
    })
);
