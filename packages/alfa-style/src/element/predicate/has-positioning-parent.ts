import { Element } from "@siteimprove/alfa-dom";
import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";

import { getPositioningParent } from "../helpers/get-positioning-parent";

/**
 * @public
 */
export function hasPositioningParent(
  device: Device,
  predicate: Predicate<Element>
): Predicate<Element> {
  return (element) => getPositioningParent(element, device).some(predicate);
}
