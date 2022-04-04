import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { isPerceivable } from "./is-perceivable";

const { isContent } = Element;
const { and } = Predicate;

/**
 * {@link https://act-rules.github.io/glossary/#just-before}
 *
 * ACT rules requires the second node to be perceivable content.
 * Since we cannot really enforce that at type level, and plan to use that
 * with `<main>` as second node, we extend the concept to "at the start":
 *
 * there is no perceivable *content* between the first (included) and
 * second (excluded) of the nodes, in tree order in the flat tree.
 *
 * Thus:
 * * [N1, …, N2] => N1 is at the start of N2 if no perceivable in [N1, …, N2[
 * * [N2, …, N1] => N1 is at the start of N2 if no perceivable in [N2, …, N1[
 * In both cases, jumping to N1 give access to all the perceivable nodes
 * after N2, and no more.
 *
 * Perceivable containers (e.g. <div><span>Hello</span></div>) are actually OK,
 * only perceivable actual content is bad.
 *
 * Note that the def is actually symmetrical, but N2 is conceptually a
 * container (`<main>`) while N1 is a single point (an anchor),
 * hence the asymmetry in the code.
 *
 * Complexity: the size of the subtree anchored at the lowest common ancestor.
 */
export function isAtTheStart(
  node2: Node,
  device: Device = Device.standard()
): Predicate<Node> {
  return (node1) =>
    !Node.getNodesBetween(node1, node2, {
      includeFirst: true,
      includeSecond: false,
    }).some(
      and(isPerceivable(device), isContent({ flattened: true, nested: true }))
    );
}
