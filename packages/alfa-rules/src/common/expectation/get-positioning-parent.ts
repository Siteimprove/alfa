import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import { isPositioned } from "../predicate";
import { getOffsetParent } from "./get-offset-parent";

const { isElement } = Element;

export function getPositioningParent(
  element: Element,
  device: Device
): Option<Element> {
  if (isPositioned(device, "relative", "static", "sticky")(element)) {
    return element.parent({ flattened: true }).filter(isElement);
  } else {
    return getOffsetParent(element, device);
  }
}
