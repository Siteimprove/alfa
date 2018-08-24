import { BrowserSpecific, map } from "@siteimprove/alfa-compatibility";
import { Element, Node } from "@siteimprove/alfa-dom";
import { getRole } from "./get-role";
import { Landmark } from "./roles/abstract/landmark";

/**
 * Check if an element is a landmark.
 *
 * @see https://www.w3.org/TR/wai-aria/#landmark_roles
 *
 * @param element The element to check.
 * @return `true` if the element is landmark, otherwise `false`.
 */
export function isLandmark(
  element: Element,
  context: Node
): boolean | BrowserSpecific<boolean> {
  return map(getRole(element, context), role => {
    if (role === null) {
      return false;
    }

    const inherits =
      typeof role.inherits === "function"
        ? role.inherits(element, context)
        : role.inherits;

    return (
      inherits !== undefined && inherits.some(ancestor => ancestor === Landmark)
    );
  });
}
