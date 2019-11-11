import { getRole, Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

export function hasRole(
  context: Node,
  device: Device,
  role: Role
): Predicate<Element> {
  return element =>
    Iterable.some(getRole(element, context, device), ([role]) =>
      role.filter(Predicate.equals(role)).isSome()
    );
}
