import { DOM } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

const { isIgnored } = DOM;
const { and, not } = Predicate;
const { isVisible } = Style;

/**
 * Check if a node is perceivable.
 *
 * @remarks
 * A node is considered perceivable if it's visible and has inclusive
 * descendants that are not ignored in the accessibility tree.
 */
export function isPerceivable<T extends Node>(device: Device): Predicate<T> {
  const foo = Style;
  const bar = foo.isVisible;

  return and(isVisible(device), (node) =>
    node.inclusiveDescendants().some(not(isIgnored(device)))
  );
}
