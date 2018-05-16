import { Node, Element, Attribute } from "./types";
/**
 * @see https://www.w3.org/TR/html/infrastructure.html#namespaces
 */
export enum Namespace {
  /**
   * @see https://www.w3.org/TR/html/infrastructure.html#html-namespace
   */
  HTML = "http://www.w3.org/1999/xhtml",

  /**
   * @see https://www.w3.org/TR/html/infrastructure.html#mathml-namespace
   */
  MathML = "http://www.w3.org/1998/Math/MathML",

  /**
   * @see https://www.w3.org/TR/html/infrastructure.html#svg-namespace
   */
  SVG = "http://www.w3.org/2000/svg",

  /**
   * @see https://www.w3.org/TR/html/infrastructure.html#xlink-namespace
   */
  XLink = "http://www.w3.org/1999/xlink",

  /**
   * @see https://www.w3.org/TR/html/infrastructure.html#xml-namespace
   */
  XML = "http://www.w3.org/XML/1998/namespace",

  /**
   * @see https://www.w3.org/TR/html/infrastructure.html#xmlns-namespace
   */
  XMLNS = "http://www.w3.org/2000/xmlns/"
}

export function getNamespace(element: Element, context: Node): Namespace | null;

export function getNamespace(
  attribute: Attribute,
  context: Node
): Namespace | null;

export function getNamespace(
  node: Element | Attribute,
  context: Node
): Namespace | null {
  if (node.namespaceURI !== null) {
    switch (node.namespaceURI) {
      case Namespace.HTML:
      case Namespace.SVG:
        return node.namespaceURI;
    }
  }

  return null;
}
