import type { Element } from "@siteimprove/alfa-dom";
import type { Device } from "@siteimprove/alfa-device";
import type { Predicate } from "@siteimprove/alfa-predicate";

import { getPositioningParent } from "../helpers/get-positioning-parent.js";

/**
 * @public
 */
export function hasPositioningParent(
  device: Device,
  predicate: Predicate<Element>,
): Predicate<Element> {
  return (element) => getPositioningParent(element, device).some(predicate);
}
