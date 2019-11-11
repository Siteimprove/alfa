import { Roles } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasRole } from "./has-role";

export function isDecorative(
  context: Node,
  device: Device
): Predicate<Element> {
  return Predicate.or(
    hasRole(context, device, Roles.None),
    hasRole(context, device, Roles.Presentation)
  );
}
