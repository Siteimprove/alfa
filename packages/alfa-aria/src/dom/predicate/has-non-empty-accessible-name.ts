import { Device } from "@siteimprove/alfa-device";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasAccessibleName } from "./has-accessible-name";
import { hasValue } from "../../name/predicate/has-value";

/**
 * @public
 */
export function hasNonEmptyAccessibleName<T extends Element | Text>(
  device: Device
): Predicate<T> {
  return hasAccessibleName(
    device,
    hasValue((value) => value.trim().length > 0)
  );
}
