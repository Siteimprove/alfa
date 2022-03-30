import { DOM, Name } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasNonEmptyAccessibleName<T extends Element | Text>(
  device: Device
): Predicate<T> {
  return DOM.hasAccessibleName(
    device,
    Name.hasValue((value) => value.trim().length > 0)
  );
}
