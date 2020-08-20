import { Name } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasAccessibleName } from "./has-accessible-name";

const { not } = Predicate;
const { isEmpty } = Iterable;

export function hasNonEmptyAccessibleName<T extends Element | Text>(
  device: Device
): Predicate<T> {
  return hasAccessibleName(device, Name.hasValue(not(isEmpty)));
}
