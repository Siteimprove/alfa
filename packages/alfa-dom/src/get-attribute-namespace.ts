import { getElementNamespace } from "./get-element-namespace";
import { Attribute, Element, Namespace, Node } from "./types";

/**
 * Given an attribute, the element that the attribute belongs to, and a context,
 * get the namespace of the attribute of the element within the context. If the
 * attribute does not have an associated namespace then `null` is returned.
 *
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
  }

  return null;
}
