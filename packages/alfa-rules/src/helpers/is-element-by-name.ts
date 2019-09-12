import {
  Element,
  getElementNamespace,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";

export function isElementByName(
  element: Element,
  context: Node,
  names: string | Array<string>,
  namespaces: Namespace | Array<Namespace> = Namespace.HTML
): boolean {
  if (!new Set(namespaces).has(getElementNamespace(element, context))) {
    return false;
  }

  return new Set(names).has(element.localName);
}
