import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

import type { Element } from "../../slotable/element.js";
import type { Node } from "../../../node.js";

import { isReplaced } from "./is-replaced.js";

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
  defaultTraversal: Node.Traversal,
): (options?: Node.Traversal) => Predicate<Node> {
  return (options = defaultTraversal) =>
    or((node) => node.children(options).isEmpty(), and(isElement, isReplaced));
}
