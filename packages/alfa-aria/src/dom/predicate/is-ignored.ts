import { Device } from "@siteimprove/alfa-device";
import { Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { Node as ariaNode } from "../..";

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
