import { Element } from "./types";
import { getTag } from "./get-tag";
import { getAttribute } from "./get-attribute";
import { hasAttribute } from "./has-attribute";

const { isNaN } = Number;

/**
 * @see https://www.w3.org/TR/html/editing.html#the-tabindex-attribute
 */
export function getTabIndex(element: Element): number | null {
  const tabIndex = getAttribute(element, "tabindex");

  if (tabIndex !== null && !isNaN(parseInt(tabIndex))) {
    return parseInt(tabIndex);
  }

  if (isSuggestedFocusableElement(element)) {
    return 0;
  }

  return null;
}

function isSuggestedFocusableElement(element: Element): boolean {
  switch (getTag(element)) {
    case "a":
    case "link":
      if (hasAttribute(element, "href")) {
        return true;
      }
      break;
    case "input":
      if (getAttribute(element, "type") !== "hidden") {
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
  return getTag(element) === "iframe";
}
