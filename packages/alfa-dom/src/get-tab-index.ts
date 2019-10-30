import { None, Option, Some } from "@siteimprove/alfa-option";
import { getAttribute } from "./get-attribute";
import { getInputType, InputType } from "./get-input-type";
import { getParentElement } from "./get-parent-element";
import { hasAttribute } from "./has-attribute";
import { Element, Node } from "./types";

const { isNaN } = Number;

/**
 * Given an element, get the tab index of the element.
 *
 * @see https://html.spec.whatwg.org/#attr-tabindex
 */
export function getTabIndex(element: Element, context: Node): Option<number> {
  return getAttribute(element, context, "tabindex")
    .andThen(tabIndex => {
      const number = Number(tabIndex);

      if (isNaN(number) || number !== (number | 0)) {
        return None;
      }

      return Some.of(number);
    })
    .orElse(() => {
      if (isSuggestedFocusableElement(element, context)) {
        return Some.of(0);
      }

      return None;
    });
}

function isSuggestedFocusableElement(element: Element, context: Node): boolean {
  switch (element.localName) {
    case "a":
    case "link":
      return hasAttribute(element, context, "href");

    case "input":
      return getInputType(element, context)
        .map(inputType => inputType !== InputType.Hidden)
        .getOr(true);

    case "audio":
    case "video":
      return hasAttribute(element, context, "controls");

    case "button":
    case "select":
    case "textarea":
      return true;

    // The W3C snapshot of the HTML specification leaves out the case of a
    // `<summary>` element that is the first element child of a `<details>`
    // element.
    case "summary":
      return getParentElement(element, context)
        .map(parentElement => {
          if (parentElement.localName === "details") {
            const { childNodes } = parentElement;

            for (let i = 0, n = childNodes.length; i < n; i++) {
              const childNode = childNodes[i];

              if (childNode === element) {
                return true;
              }
            }
          }

          return false;
        })
        .getOr(false);
  }

  return (
    hasAttribute(element, context, "draggable") ||
    isEditingHost(element, context) ||
    isBrowsingContextContainer(element)
  );
}

/**
 * @see https://html.spec.whatwg.org/#editing-host
 */
function isEditingHost(element: Element, context: Node): boolean {
  return hasAttribute(element, context, "contenteditable");
}

/**
 * @see https://html.spec.whatwg.org/#browsing-context-container
 */
function isBrowsingContextContainer(element: Element): boolean {
  return element.localName === "iframe";
}
