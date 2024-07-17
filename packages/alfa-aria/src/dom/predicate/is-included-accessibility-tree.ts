import type { Device } from "@siteimprove/alfa-device";
import type { Node } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";

import { Node as ariaNode } from "../../index.js";

/**
 * Check if a node is included in the accessibility tree.
 *
 * @remarks
 * It's possible for a node itself to be ignored in the accessibility tree while
 * still having children that aren't.
 *
 * @public
 */
export function isIncludedInTheAccessibilityTree<T extends Node>(
  device: Device,
): Predicate<T> {
  return (node) => !ariaNode.from(node, device).isIgnored();
}

/**
 * Check if a node is ignored in the accessibility tree.
 *
 * @remarks
 * It's possible for a node itself to be ignored in the accessibility tree while
 * still having children that aren't.
 *
 * @public
 */
export function isIgnored<T extends Node>(device: Device): Predicate<T> {
  return (node) => ariaNode.from(node, device).isIgnored();
}
