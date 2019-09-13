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
  const namesSet = new Set(names instanceof Array ? names : [names]);
  const namespacesSet = new Set(
    namespaces instanceof Array ? namespaces : [namespaces]
  );
  const elementNamespace = getElementNamespace(element, context);

  return (
    elementNamespace !== null &&
    namespacesSet.has(elementNamespace) &&
    namesSet.has(element.localName)
  );
}
