import { Length, Percentage, BorderRadius } from "@siteimprove/alfa-css";

import { Property } from "../property";
import { Resolver } from "../resolver";

/**
 * @internal
 */
export type Specified = BorderRadius<Length | Percentage>;

/**
 * @internal
 */
export type Computed = BorderRadius<Length<"px"> | Percentage>;

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-left-radius
 * @internal
 */
export default Property.of<Specified, Computed>(
  BorderRadius.of(Length.of(0, "px"), Length.of(0, "px")),
  // TODO
  BorderRadius.parse,
  (value, style) =>
    value.map((value) => {
      return BorderRadius.of(
        Length.isLength(value.horizontal)
          ? Resolver.length(value.horizontal, style)
          : value.horizontal,
        Length.isLength(value.vertical)
          ? Resolver.length(value.vertical, style)
          : value.vertical
      );
    })
);
