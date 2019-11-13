import { Roles } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasRole } from "./has-role";

const { equals } = Predicate;

export function isDecorative(
  context: Node,
  device: Device
): Predicate<Element> {
  return hasRole(context, device, equals(Roles.None, Roles.Presentation));
}
