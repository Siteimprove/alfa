import { Element } from "@siteimprove/alfa-dom";
import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

const { getPositioningParent } = Style;

export function hasPositioningParent(
  device: Device,
  predicate: Predicate<Element>
): Predicate<Element> {
  return (element) => getPositioningParent(element, device).some(predicate);
}
