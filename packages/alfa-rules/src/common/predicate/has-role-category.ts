import { Category, getRoleCategory } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasRoleCategory(
  context: Node,
  device: Device,
  predicate: Predicate<Category> = () => true
): Predicate<Element> {
  return element =>
    getRoleCategory(element, context, device).some(category =>
      category.filter(predicate).isSome()
    );
}
