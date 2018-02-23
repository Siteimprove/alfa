import { Element } from "@alfa/dom";
import { getRole } from "./get-role";
import { Landmark } from "../roles/abstract";

/**
 * Check if an element is a landmark.
 *
 * @see https://www.w3.org/TR/wai-aria/#landmark_roles
 *
 * @param element The element to check.
 * @return `true` if the element is landmark, otherwise `false`.
 */
export function isLandmark(element: Element): boolean {
  const role = getRole(element);

  if (role === null) {
    return false;
  }

  const { inherits = [] } = role;

  for (const ancestor of inherits) {
    if (ancestor === Landmark) {
      return true;
    }
  }

  return false;
}
