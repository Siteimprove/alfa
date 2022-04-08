import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasComputedStyle } from "./has-computed-style";

const { equals } = Predicate;

/**
 * @public
 */
export function isPositioned(
  device: Device,
  ...positions: Array<string>
): Predicate<Element> {
  return hasComputedStyle(
    "position",
    (position) => positions.some(equals(position.value)),
    device
  );
}
