import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
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
): Branched<boolean, Browser> {
  return getRoleCategory(element, context, device).map(category =>
    category.includes(Category.Widget)
  );
}
