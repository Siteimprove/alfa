import type { Device } from "@siteimprove/alfa-device";
import type { Element } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";

import { getClickableRegion } from "../dom/get-clickable-region.js";

/**
 * @remarks
 * This predicate tests that the clickable region of an element has sufficient size.
 * A region of boxes has sufficient size if any of the constituent boxes has width and height larger than a given value.
 * Defaults to true if called on an element without clickable region to avoid false positives.
 */
export function hasSufficientSize(
  size: number,
  device: Device,
): Predicate<Element> {
  return (element) =>
    getClickableRegion(device, element)
      .map((boxes) =>
        boxes.some((box) => box.width >= size && box.height >= size),
      )
      .getOr(true);
}
