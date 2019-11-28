import { Style } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { isRendered } from "./is-rendered";
import { isDecorative } from "./is-decorative";

const { and, or, not } = Predicate;

export function isIgnored<T extends Node>(device: Device): Predicate<T> {
  return or(
    or(not(isRendered(device)), and(Element.isElement, isDecorative)),
    node => {
      if (Element.isElement(node)) {
        if (
          node
            .attribute("aria-hidden")
            .some(attr => attr.value.toLowerCase() === "true")
        ) {
          return true;
        }

        const visibility = Style.from(node).computed("visibility");

        if (
          visibility.some(visibility => visibility.value.value !== "visible")
        ) {
          return true;
        }
      }

      return false;
    }
  );
}
