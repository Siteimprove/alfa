import { Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";

export function isSupportedAttribute(
  element: Element,
  context: Node,
  attributeName: string,
  role: Role,
  device: Device
): boolean {
  const supported =
    role.supported === undefined
      ? []
      : role.supported(element, context, device);

  for (const attribute of supported) {
    if (attribute.name === attributeName) {
      return true;
    }
  }

  const inherits =
    role.inherits === undefined ? [] : role.inherits(element, context, device);

  for (const role of inherits) {
    if (isSupportedAttribute(element, context, attributeName, role, device)) {
      return true;
    }
  }

  return false;
}
