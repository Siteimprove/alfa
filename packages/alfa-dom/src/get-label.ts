import { getAttribute } from "./get-attribute";
import { getClosest } from "./get-closest";
import { getId } from "./get-id";
import { getRootNode } from "./get-root-node";
import { isElement } from "./guards";
import { isLabelable } from "./is-labelable";
import { querySelector } from "./query-selector";
import { Element, Node } from "./types";

/**
 * Given an element and a context, get the form label associated with the
 * element. If no form label is associated with the element within the context,
 * `null` is returned.
 *
 * @example
 * const input = <input type="text" id="foo" />;
 * const form = (
 *   <form>
 *     <label for="foo">Foo</label>
 *     {input}
 *   </form>
 * );
 * getLabel(input, form);
 * // => <label for="foo">...</label>
 *
 * @see https://html.spec.whatwg.org/#labeled-control
 */
export function getLabel(element: Element, context: Node): Element | null {
  if (!isLabelable(element)) {
    return null;
  }

  const id = getId(element);

  if (id !== null && id !== "") {
    const rootNode = getRootNode(element, context);

    if (rootNode !== element) {
      const label = querySelector(
        rootNode,
        context,
        node =>
          isElement(node) &&
          node.localName === "label" &&
          getAttribute(node, "for") === id
      );

      const target = querySelector(
        rootNode,
        context,
        node => isElement(node) && getId(node) === id
      );

      if (label !== null && target === element) {
        return label as Element;
      }
    }
  }

  return getClosest(element, context, "label");
}
