import { Device } from "@siteimprove/alfa-device";
import { getTabIndex } from "./get-tab-index";
import { isDisabled } from "./is-disabled";
import { isRendered } from "./is-rendered";
import { Element, Node } from "./types";

/**
 * Given an element and a context, check if the element is focusable within the
 * context.
 *
 * @see https://html.spec.whatwg.org/#focusable-area
 */
export function isFocusable(
  element: Element,
  context: Node,
  device: Device
): boolean {
  return (
    getTabIndex(element, context) !== null &&
    !isDisabled(element, context) &&
    isRendered(element, context, device)
  );
}
