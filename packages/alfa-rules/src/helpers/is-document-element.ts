import { Element, getParentNode, Node } from "@siteimprove/alfa-dom";
import { isElement, nameIs } from "./predicates";

export function isDocumentElement(element: Element, context: Node): boolean {
  return isElement
    .and(nameIs("html"))
    .and(element => getParentNode(element, context) === context)
    .test(element);
}
