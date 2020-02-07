import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Style } from "@siteimprove/alfa-style";

import { isRendered } from "./is-rendered";
import { isTransparent } from "./is-transparent";

const { and, not } = Predicate;

export function isVisible<T extends Node>(device: Device): Predicate<T> {
  return and(and(isRendered(device), not(isTransparent(device))), node => {
    if (Element.isElement(node)) {
      const visibility = Style.from(node, device).computed("visibility").value;

      if (visibility.value !== "visible") {
        return false;
      }
    }

    return true;
  });
}
