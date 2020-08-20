import { Name, Node } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasAccessibleName<T extends Element | Text>(
  device: Device,
  predicate: Predicate<Name> = () => true
): Predicate<T> {
  return (node) =>
    Node.from(node, device).some((node) => node.name.some(predicate));
}
