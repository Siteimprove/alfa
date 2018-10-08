import { getAttributeNode } from "./get-attribute-node";
import { Element, Namespace, Node } from "./types";

export interface AttributeOptions {
  readonly trim?: boolean;
  readonly lowerCase?: boolean;
}

/**
 * @see https://www.w3.org/TR/dom/#dom-element-getattribute
 *
 * @example
 * const div = <div title="Foo" />;
 * getAttribute(div, "title");
 * // => "Foo"
 */
export function getAttribute(
  element: Element,
  qualifiedName: string,
  options?: AttributeOptions
): string | null;

/**
 * @see https://www.w3.org/TR/dom/#dom-element-getattributens
 */
export function getAttribute(
  element: Element,
  context: Node,
  localName: string,
  namespace: Namespace | null,
  options?: AttributeOptions
): string | null;

export function getAttribute(
  element: Element,
  context: Node,
  localName: string,
  namespace: "*",
  options?: AttributeOptions
): Array<string> | null;

export function getAttribute(
  element: Element,
  context: Node | string,
  name: string | AttributeOptions = {},
  namespace?: Namespace | "*" | null,
  options: AttributeOptions = {}
): string | Array<string> | null {
  if (namespace === undefined) {
    options = name as AttributeOptions;
    name = context as string;
  }

  if (namespace === undefined) {
    const qualifiedName = name as string;

    const attribute = getAttributeNode(element, qualifiedName);

    if (attribute === null) {
      return null;
    }

    return applyOptions(attribute.value, options);
  } else {
    context = context as Node;

    const localName = name as string;

    if (namespace === "*") {
      const attributes = getAttributeNode(
        element,
        context,
        localName,
        namespace
      );

      if (attributes === null) {
        return null;
      }

      return attributes.map(attribute =>
        applyOptions(attribute.value, options)
      );
    } else {
      const attribute = getAttributeNode(
        element,
        context,
        localName,
        namespace
      );

      if (attribute === null) {
        return null;
      }

      return applyOptions(attribute.value, options);
    }
  }
}

function applyOptions(value: string, options: AttributeOptions): string {
  if (options.trim === true) {
    value = value.trim();
  }

  if (options.lowerCase === true) {
    value = value.toLowerCase();
  }

  return value;
}
