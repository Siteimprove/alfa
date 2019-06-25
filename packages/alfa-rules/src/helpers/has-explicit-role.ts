import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";

import { getExplicitRole } from "./get-explicit-role";

const { map } = BrowserSpecific;

export function hasExplicitRole(
  element: Element,
  context: Node,
  device: Device
): boolean | BrowserSpecific<boolean> {
  return map(getExplicitRole(element, context, device), explicitRole => {
    return explicitRole !== null;
  });
}
