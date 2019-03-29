import { isExposed } from "@siteimprove/alfa-aria";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, isVisible, Node, Text } from "@siteimprove/alfa-dom";

export function isPerceivable(
  node: Element | Text | null,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return (
    node !== null &&
    isVisible(node, context, device) &&
    isExposed(node, context, device)
  );
}
