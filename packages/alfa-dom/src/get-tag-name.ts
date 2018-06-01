import { Node, Element, Namespace } from "./types";
import { getElementNamespace } from "./get-element-namespace";

/**
 * Given an element and a context, get the tag name of the element.
 *
 * @see https://www.w3.org/TR/dom/#dom-element-tagname
 */
export function getTagName(element: Element, context: Node): string {
  let qualifiedName: string;

  if (element.prefix !== null) {
    qualifiedName = element.prefix + ":" + element.localName;
  } else {
    qualifiedName = element.localName;
  }

  if (getElementNamespace(element, context) === Namespace.HTML) {
    return qualifiedName.toUpperCase();
  }

  return qualifiedName;
}
