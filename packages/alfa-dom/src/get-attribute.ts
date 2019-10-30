import { Iterable } from "@siteimprove/alfa-iterable";
import { Option } from "@siteimprove/alfa-option";
import { getAttributeNode } from "./get-attribute-node";
import { Element, Namespace, Node } from "./types";

/**
 * @see https://dom.spec.whatwg.org/#dom-element-getattribute
 */
export function getAttribute(
  element: Element,
  context: Node,
  qualifiedName: string
): Option<string>;

/**
 * @see https://dom.spec.whatwg.org/#dom-element-getattributens
 */
export function getAttribute(
  element: Element,
  context: Node,
  localName: string,
  namespace: Namespace
): Option<string>;

export function getAttribute(
  element: Element,
  context: Node,
  localName: string,
  namespace: "*"
): Option<Iterable<string>>;

export function getAttribute(
  element: Element,
  context: Node,
  name: string,
  namespace?: Namespace | "*"
): Option<string | Iterable<string>> {
  if (namespace === undefined) {
    return getAttributeNode(element, context, name).map(
      attribute => attribute.value
    );
  }

  if (namespace === "*") {
    return getAttributeNode(element, context, name, namespace).map(attributes =>
      Iterable.map(attributes, attribute => attribute.value)
    );
  }

  return getAttributeNode(element, context, name, namespace).map(
    attribute => attribute.value
  );
}
