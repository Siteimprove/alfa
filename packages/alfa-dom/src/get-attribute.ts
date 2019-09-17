import { getAttributeNode } from "./get-attribute-node";
import { Element, Namespace, Node } from "./types";

/**
 * @see https://dom.spec.whatwg.org/#dom-element-getattribute
 *
 * @example
 * const div = <div title="Foo" />;
 * getAttribute(div, "title");
 * // => "Foo"
 */
export function getAttribute(
  element: Element,
  qualifiedName: string,
  options?: getAttribute.Options
): string | null;

/**
 * @see https://dom.spec.whatwg.org/#dom-element-getattributens
 */
export function getAttribute(
  element: Element,
  context: Node,
  localName: string,
  namespace: Namespace | null,
  options?: getAttribute.Options
): string | null;

export function getAttribute(
  element: Element,
  context: Node,
  localName: string,
  namespace: "*",
  options?: getAttribute.Options
): Array<string> | null;

export function getAttribute(
  element: Element,
  context: Node | string,
  name: string | getAttribute.Options = {},
  namespace?: Namespace | "*" | null,
  options: getAttribute.Options = {}
): string | Array<string> | null {
  if (namespace === undefined) {
    options = name as getAttribute.Options;
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

export namespace getAttribute {
  export interface Options {
    readonly trim?: boolean;
    readonly lowerCase?: boolean;
  }
}

function applyOptions(value: string, options: getAttribute.Options): string {
  if (options.trim === true) {
    value = value.trim();
  }

  if (options.lowerCase === true) {
    value = value.toLowerCase();
  }

  return value;
}
