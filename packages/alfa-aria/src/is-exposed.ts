import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  getParentElement,
  isElement,
  Node,
  Text
} from "@siteimprove/alfa-dom";
import { getRole } from "./get-role";
import { isVisible } from "./is-visible";
import * as Roles from "./roles";

export function isExposed(
  node: Element | Text,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  if (isElement(node)) {
    return BrowserSpecific.map(getRole(node, context, device), role => {
      if (role === Roles.Presentation || role === Roles.None) {
        return false;
      }

      return isVisible(node, context, device);
    });
  } else {
    const parentElement = getParentElement(node, context, { flattened: true });

    if (parentElement !== null) {
      return isExposed(parentElement, context, device);
    }
  }

  return isVisible(node, context, device);
}
