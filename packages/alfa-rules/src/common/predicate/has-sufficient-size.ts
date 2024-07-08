import type { Device } from "@siteimprove/alfa-device";
import type { Predicate } from "@siteimprove/alfa-predicate";
import { Element } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";

const { and } = Refinement;
const { hasInclusiveDescendant, isElement } = Element;

/**
 * @remarks
 * This predicate tests that the bounding box of an element or one of it's element descendants
 * has width and height larger than a given value.
 *
 * Defaults to true if called on an element without bounding box to avoid false positives.
 */
export function hasSufficientSize(
  size: number,
  device: Device,
): Predicate<Element> {
  return hasInclusiveDescendant((desc) =>
    and(isElement, (element) =>
      element
        .getBoundingBox(device)
        .map((box) => box.width >= size && box.height >= size)
        .getOr(true),
    )(desc),
  );
}
