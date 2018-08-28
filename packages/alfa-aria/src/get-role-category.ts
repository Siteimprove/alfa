import { BrowserSpecific, map } from "@siteimprove/alfa-compatibility";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-util";
import { getRole } from "./get-role";
import { Category } from "./types";

/**
 * Given an element and a context, get the category of the semantic role of the
 * element within the context. If the element does not have a role then `null`
 * is returned.
 *
 * @see https://www.w3.org/TR/wai-aria/#roles_categorization
 */
export function getRoleCategory(
  element: Element,
  context: Node
): Option<Category> | BrowserSpecific<Option<Category>> {
  return map(getRole(element, context), role => {
    if (role === null) {
      return null;
    }

    return typeof role.category === "function"
      ? role.category(element, context)
      : role.category;
  });
}
