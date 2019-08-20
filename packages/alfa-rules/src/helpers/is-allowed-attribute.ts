import { Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";

import { isRequiredAttribute } from "./is-required-attribute";
import { isSupportedAttribute } from "./is-supported-attribute";

export function isAllowedAttribute(
  element: Element,
  context: Node,
  attributeName: string,
  role: Role,
  device: Device
): boolean {
  return (
    isRequiredAttribute(element, context, attributeName, role, device) ||
    isSupportedAttribute(element, context, attributeName, role, device)
  );
}
