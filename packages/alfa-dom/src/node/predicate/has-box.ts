import type { Device } from "@siteimprove/alfa-device";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Rectangle } from "@siteimprove/alfa-rectangle";

import type { Element } from "../slotable/element.js";
import type { Text } from "../slotable/text.js";

/**
 * @public
 */
export function hasBox(
  predicate: Predicate<Rectangle> = () => true,
  device: Device,
): Predicate<Element | Text> {
  return (node) => node.getBoundingBox(device).some(predicate);
}
