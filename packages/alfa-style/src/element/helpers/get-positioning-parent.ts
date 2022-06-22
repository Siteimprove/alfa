import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";

import { getOffsetParent } from "./get-offset-parent";
import { isPositioned } from "../predicate/is-positioned";

const { isElement } = Element;

/**
 * @public
 */
export function getPositioningParent(
  element: Element,
  device: Device
): Option<Element> {
  if (isPositioned(device, "relative", "static", "sticky")(element)) {
    return element.parent(Node.flatTree).filter(isElement);
  } else {
    return getOffsetParent(element, device);
  }
}
