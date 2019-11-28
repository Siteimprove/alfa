import { Device } from "@siteimprove/alfa-device";
import { Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { isIgnored } from "./is-ignored";
import { isVisible } from "./is-visible";

const { and, not } = Predicate;

export function isPerceivable(device: Device): Predicate<Node> {
  return and(isVisible(device), not(isIgnored(device)));
}
