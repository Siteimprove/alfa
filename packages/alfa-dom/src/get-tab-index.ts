import { getAttribute } from "./get-attribute";
import { getInputType } from "./get-input-type";
import { hasAttribute } from "./has-attribute";
import { Element } from "./types";

const { isNaN } = Number;

/**
 * @see https://www.w3.org/TR/html/editing.html#the-tabindex-attribute
 */
export function getTabIndex(element: Element): number | null {
  const tabIndex = getAttribute(element, "tabindex");

  if (tabIndex !== null) {
    const parsed = parseInt(tabIndex);

    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  if (isSuggestedFocusableElement(element)) {
    return 0;
  }

  return null;
}

function isSuggestedFocusableElement(element: Element): boolean {
  switch (element.localName) {
    case "a":
    case "link":
      if (hasAttribute(element, "href")) {
        return true;
      }
      break;
    case "input":
      if (getInputType(element) !== "hidden") {
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
