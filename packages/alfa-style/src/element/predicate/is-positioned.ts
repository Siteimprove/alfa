import type { Device } from "@siteimprove/alfa-device";
import type { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import type { PositionKeyword } from "../../property/position.js";
import { hasComputedStyle } from "./has-computed-style.js";

const { equals } = Predicate;

/**
 * @public
 */
export function isPositioned(
  device: Device,
  ...positions: Array<PositionKeyword>
): Predicate<Element> {
  return hasComputedStyle(
    "position",
    (position) => positions.some(equals(position.value)),
    device,
  );
}
