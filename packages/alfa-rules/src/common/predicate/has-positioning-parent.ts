import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Device } from "../../../../alfa-device/src";

import { getPositioningParent } from "../expectation/get-positioning-parent";

export function hasPositioningParent(
  device: Device,
  predicate: Predicate<Element>
): Predicate<Element> {
  return (element) => getPositioningParent(element, device).some(predicate);
}
