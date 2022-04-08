import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Element } from "../../element";
import { Node } from "../../../node";

import { isReplaced } from "./is-replaced";

const { or } = Predicate;
const { and } = Refinement;

/**
 * A node is actual content (not just a container) if it has no children,
 * or if it is a replaced element (assumed to be replaced by actual content).
 *
 * @public
 */
export function isContent(options: Node.Traversal = {}): Predicate<Node> {
  return or(
    (node) => node.children(options).isEmpty(),
    and(Element.isElement, isReplaced)
  );
}
