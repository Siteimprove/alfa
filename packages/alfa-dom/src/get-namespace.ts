import { Node, Element } from "./types";
import { isElement } from "./guards";
import { traverseNode } from "./traverse-node";

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
   * NB: The trailing slash is not a typo! For some reason it snuck its way into
   * the specification and whether or not it is strictly required is an awfully
   * good question.
   *
   * @see https://www.w3.org/TR/html/infrastructure.html#xmlns-namespace
   */
  XMLNS = "http://www.w3.org/2000/xmlns/"
}

const namespaceMaps: WeakMap<Node, WeakMap<Element, Namespace>> = new WeakMap();

/**
 * @see https://www.w3.org/TR/dom/#dom-element-namespaceuri
 */
export function getNamespace(
  element: Element,
  context: Node
): Namespace | null {
  let namespaceMap = namespaceMaps.get(context);

  if (namespaceMap === undefined) {
    namespaceMap = new WeakMap();

    traverseNode(context, {
      enter(node, parentNode) {
        if (!isElement(node)) {
          return;
        }

        if (node.localName === "svg") {
          namespaceMap!.set(node, Namespace.SVG);
          return;
        }

        if (node.localName === "math") {
          namespaceMap!.set(node, Namespace.MathML);
          return;
        }

        let parentNamespace: Namespace | null = null;

        if (parentNode !== null && isElement(parentNode)) {
          // As we're doing a top-down traversal, setting the namespace of
          // every parent element before visiting its children, we can safely
          // assert that the parent node will have a namespace defined.
          parentNamespace = namespaceMap!.get(parentNode)!;
        } else {
          namespaceMap!.set(node, Namespace.HTML);
          return;
        }

        switch (parentNamespace) {
          case Namespace.SVG:
            if (node.localName === "foreignObject") {
              namespaceMap!.set(node, Namespace.HTML);
            } else {
              namespaceMap!.set(node, parentNamespace);
            }
            break;
          default:
            namespaceMap!.set(node, parentNamespace);
        }
      }
    });

    namespaceMaps.set(context, namespaceMap);
  }

  return namespaceMap.get(element) || null;
}
