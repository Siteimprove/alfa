import type { Sequence } from "@siteimprove/alfa-sequence";
import { Node } from "../../node.js";
import type { Element } from "../element.js";

import { getElementDescendants } from "./element-descendants.js";

/**
 * @public
 */
export function getInclusiveElementDescendants(
  node: Element,
  options: Node.Traversal = Node.Traversal.empty,
): Sequence<Element> {
  return getElementDescendants(node, options).prepend(node);
}
