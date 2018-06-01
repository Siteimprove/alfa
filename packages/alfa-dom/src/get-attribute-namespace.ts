import { Node, Element, Attribute, Namespace } from "./types";
import { getElementNamespace } from "./get-element-namespace";

/**
 * @see https://www.w3.org/TR/dom/#dom-attr-namespaceuri
 */
export function getAttributeNamespace(
  attribute: Attribute,
  element: Element,
  context: Node
): Namespace | null {
  const elementNamespace = getElementNamespace(element, context);

  if (elementNamespace === null || elementNamespace === Namespace.HTML) {
    return null;
  }

  // https://www.w3.org/TR/html/syntax.html#adjust-foreign-attributes

  if (attribute.prefix === null) {
    return attribute.localName === "xmlns" ? Namespace.XMLNS : null;
  }

  switch (attribute.prefix) {
    case "xlink":
      switch (attribute.localName) {
        case "actutate":
        case "arcrole":
        case "href":
        case "role":
        case "show":
        case "title":
        case "type":
          return Namespace.XLink;
      }
      break;
    case "xml":
      switch (attribute.localName) {
        case "lang":
        case "space":
          return Namespace.XML;
      }
      break;
    case "xmlns":
      if (attribute.localName === "xlink") {
        return Namespace.XMLNS;
      }
      break;
  }

  return null;
}
