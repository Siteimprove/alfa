import { Device } from "@siteimprove/alfa-device";
import { Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

import { isIncludedInTheAccessibilityTree } from "./is-included-accessibility-tree";

const { and } = Predicate;
const { isVisible } = Style;

/**
 * Check if a node is perceivable for all users.
 *
 * @remarks
 * A node is considered perceivable for all if it's visible and has inclusive
 * descendants that are not ignored in the accessibility tree.
 *
 * @public
 */
export function isPerceivableForAll<T extends Node>(
  device: Device
): Predicate<T> {
  return and(isVisible(device), (node) =>
    node.inclusiveDescendants().some(isIncludedInTheAccessibilityTree(device))
  );
}
