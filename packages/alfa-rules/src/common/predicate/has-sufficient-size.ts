import type { Device } from "@siteimprove/alfa-device";
import type { Element } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";

import { getClickableRegion } from "../dom/get-clickable-region.js";

/**
 * Returns a predicate testing that the clickable region of an element contains a sufficiently large rectangle.
 */
export function hasSufficientSize(
  size: number,
  device: Device,
): Predicate<Element> {
  return (element) =>
    getClickableRegion(device, element).some(
      (box) => box.width >= size && box.height >= size,
    );
}
