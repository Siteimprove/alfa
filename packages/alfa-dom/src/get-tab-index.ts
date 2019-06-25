import { getAttribute } from "./get-attribute";
import { getInputType, InputType } from "./get-input-type";
import { getParentElement } from "./get-parent-element";
import { isElement } from "./guards";
import { hasAttribute } from "./has-attribute";
import { Element, Node } from "./types";

const { isNaN } = Number;

/**
 * Given an element, get the tab index of the element.
 *
 * @see https://www.w3.org/TR/html/editing.html#the-tabindex-attribute
 */
export function getTabIndex(element: Element, context: Node): number | null {
  const tabIndex = getAttribute(element, "tabindex");

  if (tabIndex !== null) {
    const number = Number(tabIndex);

    if (!isNaN(number) && number === (number | 0)) {
      return number;
    }
  }

  if (isSuggestedFocusableElement(element, context)) {
    return 0;
  }

  return null;
}

function isSuggestedFocusableElement(element: Element, context: Node): boolean {
  switch (element.localName) {
    case "a":
    case "link":
      if (hasAttribute(element, "href")) {
        return true;
      }
      break;

    case "input":
      if (getInputType(element) !== InputType.Hidden) {
        return true;
      }
      break;

    case "audio":
    case "video":
      if (hasAttribute(element, "controls")) {
        return true;
      }
      break;

    case "button":
    case "select":
    case "textarea":
      return true;

    // The W3C snapshot of the HTML specification leaves out the case of a
    // `<summary>` element that is the first element child of a `<details>`
    // element.
    case "summary":
      const parentElement = getParentElement(element, context);

      if (parentElement !== null && parentElement.localName === "details") {
        const { childNodes } = parentElement;

        for (let i = 0, n = childNodes.length; i < n; i++) {
          const childNode = childNodes[i];

          if (isElement(childNode)) {
            if (childNode === element) {
              return true;
            }

            break;
          }
        }
      }
  }

  return (
    hasAttribute(element, "draggable") ||
    isEditingHost(element) ||
    isBrowsingContextContainer(element)
  );
}

/**
 * @see https://www.w3.org/TR/html/editing.html#editing-host
 */
function isEditingHost(element: Element): boolean {
  return hasAttribute(element, "contenteditable");
}

/**
 * @see https://www.w3.org/TR/html/browsers.html#browsing-context-container
 */
function isBrowsingContextContainer(element: Element): boolean {
  return element.localName === "iframe";
}
