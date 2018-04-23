import { Node, Element } from "./types";
import { isElement } from "./guards";
import { find } from "./find";
import { closest } from "./closest";
import { getTag } from "./get-tag";
import { getRoot } from "./get-root";
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
    const root = getRoot(element, context);

    if (root !== null) {
      const label = find<Element>(
        root,
        context,
        node =>
          isElement(node) &&
          getTag(node) === "label" &&
          getAttribute(node, "for") === id
      );

      if (label !== null) {
        return label;
      }
    }
  }

  return closest(element, context, "label");
}
