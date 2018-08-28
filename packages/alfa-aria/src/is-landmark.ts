import { BrowserSpecific, map } from "@siteimprove/alfa-compatibility";
import { Element, Node } from "@siteimprove/alfa-dom";
import { getRoleCategory } from "./get-role-category";
import { Category } from "./types";

/**
 * Given an element and a context, check if the element is a landmark within
 * the context.
 *
 * @see https://www.w3.org/TR/wai-aria/#landmark_roles
 */
export function isLandmark(
  element: Element,
  context: Node
): boolean | BrowserSpecific<boolean> {
  return map(getRoleCategory(element, context), category => {
    return category === Category.Landmark;
  });
}
