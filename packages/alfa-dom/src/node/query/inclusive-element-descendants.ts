import type { Sequence } from "@siteimprove/alfa-sequence";
import { Node } from "../../node.js";
import { Element } from "../element.js";

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
