import { Device } from "@siteimprove/alfa-device";
import { Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import * as aria from "@siteimprove/alfa-aria";

export function isIgnored<T extends Node>(device: Device): Predicate<T> {
  return (node) =>
    aria.Node.from(node, device).some((node) => node.isIgnored());
}
