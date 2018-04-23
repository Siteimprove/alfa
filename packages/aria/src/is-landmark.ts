import { Node, Element } from "@alfa/dom";
import { getRole } from "./get-role";
import { Landmark } from "./roles/abstract";

/**
 * Check if an element is a landmark.
 *
 * @see https://www.w3.org/TR/wai-aria/#landmark_roles
 *
 * @param element The element to check.
 * @return `true` if the element is landmark, otherwise `false`.
 */
export function isLandmark(element: Element, context: Node): boolean {
  const role = getRole(element, context);

  if (role === null) {
    return false;
  }

  const { inherits = [] } = role;

  return inherits.some(ancestor => ancestor === Landmark);
}
