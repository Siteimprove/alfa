import { isExposed } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function isIgnored<T extends Element | Text>(
  context: Node,
  device: Device
): Predicate<T> {
  return node => isExposed(node, context, device).some(isExposed => !isExposed);
}
