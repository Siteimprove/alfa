import { getAccessibleName } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasAccessibleName<T extends Element | Text>(
  device: Device,
  predicate: Predicate<string> = () => true
): Predicate<T> {
  return node =>
    getAccessibleName(node, device).some(accessibleName =>
      accessibleName.filter(predicate).isSome()
    );
}
