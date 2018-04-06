import { Element } from "./types";
import { isElement } from "./guards";
import { find } from "./find";
import { closest } from "./closest";
import { getTag } from "./get-tag";
import { getRoot } from "./get-root";
import { getAttribute } from "./get-attribute";
import { isLabelable } from "./is-labelable";

/**
 * @see https://www.w3.org/TR/html/forms.html#labeled-control
 */
export function getLabel(element: Element): Element | null {
  if (!isLabelable(element)) {
    return null;
  }

  const id = getAttribute(element, "id");

  if (id !== null && id !== "") {
    const root = getRoot(element);

    if (root !== null) {
      const label = find<Element>(
        root,
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

  return closest(element, "label");
}
