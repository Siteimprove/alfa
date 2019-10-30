import { None, Option, Some } from "@siteimprove/alfa-option";
import { getElementNamespace } from "./get-element-namespace";
import { getOwnerElement } from "./get-owner-element";
import { Attribute, Namespace, Node } from "./types";

/**
 * Given an attribute and a context, get the namespace of the attribute within
 * the context. If the attribute does not have an associated namespace then
 * `null` is returned.
 *
 * @see https://dom.spec.whatwg.org/#dom-attr-namespaceuri
 */
export function getAttributeNamespace(
  attribute: Attribute,
  context: Node
): Option<Namespace> {
  return getOwnerElement(attribute, context)
    .flatMap(ownerElement => getElementNamespace(ownerElement, context))
    .filter(elementNamespace => elementNamespace !== Namespace.HTML)
    .flatMap(() => {
      // https://html.spec.whatwg.org/#adjust-foreign-attributes

      if (attribute.prefix === null) {
        return attribute.localName === "xmlns"
          ? Some.of(Namespace.XMLNS)
          : None;
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
              return Some.of(Namespace.XLink);
          }
          break;
        case "xml":
          switch (attribute.localName) {
            case "lang":
            case "space":
              return Some.of(Namespace.XML);
          }
          break;
        case "xmlns":
          if (attribute.localName === "xlink") {
            return Some.of(Namespace.XMLNS);
          }
      }

      return None;
    });
}
