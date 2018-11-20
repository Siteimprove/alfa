import { BrowserSpecific, map } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { getRoleCategory } from "./get-role-category";
import { Category } from "./types";

/**
 * Given an element and a context, check if the element is a widget within the
 * context.
 *
 * @see https://www.w3.org/TR/wai-aria/#widget_roles
 */
export function isWidget(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return map(getRoleCategory(element, context, device), category => {
    return category === Category.Widget;
  });
}
