import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import * as dom from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function isVisible<T extends Element | Text>(
  context: Node,
  device: Device
): Predicate<T> {
  return node => dom.isVisible(node, context, device);
}
