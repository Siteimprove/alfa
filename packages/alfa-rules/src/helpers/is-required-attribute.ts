import { Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";

export function isRequiredAttribute(
  element: Element,
  context: Node,
  attributeName: string,
  role: Role,
  device: Device
): boolean {
  const required =
    role.required === undefined ? [] : role.required(element, context, device);

  for (const attribute of required) {
    if (attribute.name === attributeName) {
      return true;
    }
  }

  const inherits =
    role.inherits === undefined ? [] : role.inherits(element, context, device);

  for (const role of inherits) {
    if (isRequiredAttribute(element, context, attributeName, role, device)) {
      return true;
    }
  }

  return false;
}
