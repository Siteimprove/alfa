import { Device } from "@siteimprove/alfa-device";
import { Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { isIgnored } from "./is-ignored";
import { isVisible } from "./is-visible";

const { and, not } = Predicate;

/**
 * Check if a node is perceivable.
 *
 * @remarks
 * A node is considered perceivable if it's visible and has inclusive
 * descendants that are not ignored in the accessibility tree.
 */
export function isPerceivable<T extends Node>(device: Device): Predicate<T> {
  return and(isVisible(device), (node) =>
    node.inclusiveDescendants().some(not(isIgnored(device)))
  );
}
