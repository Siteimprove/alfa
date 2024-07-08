import type { Device } from "@siteimprove/alfa-device";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Element } from "@siteimprove/alfa-dom";

import { getClickableBox } from "../dom/get-clickable-box.js";

/**
 * @remarks
 * This predicate tests that the clickable box of an element has width and height larger than a given value.
 * Defaults to true if called on an element without clickable box to avoid false positives.
 */
export function hasSufficientSize(
  size: number,
  device: Device,
): Predicate<Element> {
  return (element) =>
    getClickableBox(device, element)
      .map((box) => box.width >= size && box.height >= size)
      .getOr(true);
}
