import { Element } from "./types";
import { Namespace, getNamespace } from "./get-namespace";

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

  if (getNamespace(element, context) === Namespace.HTML) {
    return qualifiedName.toUpperCase();
  }

  return qualifiedName;
}
