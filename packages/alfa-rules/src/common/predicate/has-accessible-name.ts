import { getAccessibleName } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasAccessibleName(
  context: Node,
  device: Device,
  predicate: Predicate<string> = () => true
): Predicate<Element | Text> {
  return node =>
    getAccessibleName(node, context, device).some(accessibleName =>
      accessibleName.filter(predicate).isSome()
    );
}
