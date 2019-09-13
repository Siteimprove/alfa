import { getElementNamespace } from "./get-element-namespace";
import { Element, Namespace, Node } from "./types";

/**
 * Given an element and a context, get the tag name of the element within the
 * context. For elements in the HTML namespace, the tag name will be upper
 * cased.
 *
 * @see https://dom.spec.whatwg.org/#dom-element-tagname
 */
export function getTagName(element: Element, context: Node): string {
  let qualifiedName: string;

  if (element.prefix !== null) {
    qualifiedName = `${element.prefix}:${element.localName}`;
  } else {
    qualifiedName = element.localName;
  }

  if (getElementNamespace(element, context) === Namespace.HTML) {
    return qualifiedName.toUpperCase();
  }

  return qualifiedName;
}
