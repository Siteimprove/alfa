import { Device } from "@siteimprove/alfa-device";
import { getElementNamespace } from "./get-element-namespace";
import { getPropertyValue } from "./get-property-value";
import { getComputedStyle } from "./get-style";
import { getTabIndex } from "./get-tab-index";
import { isFocusable } from "./is-focusable";
import { Element, Namespace, Node } from "./types";

/**
 * Given an element and a context, check if the element is tabbable within the
 * context. An element is considered tabbable if it can be reached through
 * sequential focus navgiation.
 *
 * @see https://www.w3.org/TR/html/editing.html#sequential-focus-navigation
 */
export function isTabbable(
  element: Element,
  context: Node,
  device: Device
): boolean {
  const tabIndex = getTabIndex(element, context);

  if (tabIndex === null || tabIndex < 0) {
    return false;
  }

  return (
    isFocusable(element, context, device) &&
    !redirectsFocus(element, context) &&
    !isInert(element, context, device)
  );
}

function redirectsFocus(element: Element, context: Node): boolean {
  if (getElementNamespace(element, context) === Namespace.HTML) {
    switch (element.localName) {
      // Per the sequential navigation search algorithm, browsing context
      // containers (<iframe> elements) redirect focus to either their first
      // focusable descendant or the next element in the sequential focus
      // navigation order.
      //
      // https://www.w3.org/TR/html/browsers.html#browsing-context-container
      // https://www.w3.org/TR/html/editing.html#sequential-navigation-search-algorithm
      case "iframe":
        return true;

      // <label> elements redirect focus to their control.
      //
      // https://www.w3.org/TR/html/sec-forms.html#the-label-element
      case "label":
        return true;
    }
  }

  return false;
}

function isInert(element: Element, context: Node, device: Device): boolean {
  const visibility = getPropertyValue(
    getComputedStyle(element, context, device),
    "visibility"
  );

  if (visibility !== null) {
    if (visibility.value === "hidden" || visibility.value === "collapse") {
      return true;
    }
  }

  return false;
}
