import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasExplicitRole, hasAccessibleName } from "../predicate";

const { hasName } = Element;
const { and, not } = Predicate;

export function hasRoleDependingOnName(device: Device): Predicate<Element> {
  return and(
    hasName("form", "section"),
    not(hasExplicitRole()),
    not(hasAccessibleName(device))
  );
}
