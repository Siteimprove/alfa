import { Element, getParentNode, Node } from "@siteimprove/alfa-dom";
import { isElement } from "./predicate-builder";

export function isDocumentElement(element: Element, context: Node): boolean {
  return isElement(builder =>
    builder.withName("html").and(elt => getParentNode(elt, context) === context)
  )(element);
}
