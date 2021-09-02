import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

const { isElement } = Element;

import { getOffsetParent } from "../expectation/get-offset-parent";

import { isPositioned } from "./is-positioned";
import { isVisible } from "./is-visible";

const cache = Cache.empty<Device, Cache<Node, Set<Element>>>();

export function hasInterposedDescendant(device: Device): Predicate<Element> {
  return (element) => {
    const root = element.root({
      flattened: true,
    });

    return cache
      .get(device, Cache.empty)
      .get(
        root,
        () =>
          new Set(
            root
              .inclusiveDescendants({
                flattened: true,
              })
              .filter(isElement)
              .filter(isPositioned(device, "absolute", "fixed"))
              .filter(isVisible(device))
              .collect((element) => getOffsetParent(element, device))
          )
      )
      .has(element);
  };
}
