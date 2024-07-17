import type { Device } from "@siteimprove/alfa-device";
import type { Element, Text } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";

import { hasAccessibleName } from "./has-accessible-name.js";
import { hasValue } from "../../name/predicate/has-value.js";

/**
 * @public
 */
export function hasNonEmptyAccessibleName<T extends Element | Text>(
  device: Device,
): Predicate<T> {
  return hasAccessibleName(
    device,
    hasValue((value) => value.trim().length > 0),
  );
}
