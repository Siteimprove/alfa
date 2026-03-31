import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

import type { Element } from "../../slotable/element.ts";
import type { BaseNode } from "../../node.ts";

import { isReplaced } from "./is-replaced.ts";

const { or } = Predicate;
const { and } = Refinement;

/**
 * A node is actual content (not just a container) if it has no children,
 * or if it is a replaced element (assumed to be replaced by actual content).
 *
 * @public
 */
export function isContent(
  isElement: Refinement<unknown, Element>,
  defaultTraversal: BaseNode.Traversal,
): (options?: BaseNode.Traversal) => Predicate<BaseNode> {
  return (options = defaultTraversal) =>
    or((node) => node.children(options).isEmpty(), and(isElement, isReplaced));
}
