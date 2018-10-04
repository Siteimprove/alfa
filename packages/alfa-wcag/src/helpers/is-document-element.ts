import {
  Element,
  getElementNamespace,
  getParentNode,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";

export function isDocumentElement(element: Element, context: Node): boolean {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  return (
    element.localName === "html" && getParentNode(element, context) === context
  );
}
