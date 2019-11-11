import * as aria from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasAccessibleName(
  context: Node,
  device: Device
): Predicate<Element | Text> {
  return node =>
    Iterable.some(
      aria.hasTextAlternative(node, context, device),
      ([hasTextAlternative]) => hasTextAlternative
    );
}
