import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasComputedStyle } from "../../../../alfa-style/src/element/predicate/has-computed-style";

const { equals } = Predicate;

export function isPositioned(
  device: Device,
  ...positions: Array<string>
): Predicate<Element> {
  return hasComputedStyle(
    "position",
    (position) => positions.some(equals(position.value)),
    device
  );
}
