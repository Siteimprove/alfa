import { Node, Element } from "./types";
import { isElement } from "./guards";
import { find } from "./find";
import { getClosest } from "./get-closest";
import { getRootNode } from "./get-root-node";
import { getAttribute } from "./get-attribute";
import { isLabelable } from "./is-labelable";

/**
 * Given an element and a context, get the form label associated with the
 * element, if any.
 *
 * @example
 * const input = <input type="text" id="foo" />;
 * const form = <form><label for="foo">Foo</label>{input}</form>;
 * getLabel(element, form);
 * // => <label for="foo">...</label>
 *
 * @see https://www.w3.org/TR/html/forms.html#labeled-control
 */
export function getLabel(element: Element, context: Node): Element | null {
  if (!isLabelable(element)) {
    return null;
  }

  const id = getAttribute(element, "id");

  if (id !== null && id !== "") {
    const rootNode = getRootNode(element, context);

    if (rootNode !== null) {
      const label = find<Element>(
        rootNode,
        context,
        node =>
          isElement(node) &&
          node.localName === "label" &&
          getAttribute(node, "for") === id
      );

      if (label !== null) {
        return label;
      }
    }
  }

  return getClosest(element, context, "label");
}
