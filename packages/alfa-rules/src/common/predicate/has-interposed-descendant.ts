import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";

const { and } = Refinement;
const { isElement } = Element;

import { getOffsetParent } from "../dom/get-offset-parent";

import { isPositioned } from "./is-positioned";
import { isVisible } from "./is-visible";

// For each device and document's root, we store a map from the offset parents
// to its interposed descendants
const cache = Cache.empty<
  Device,
  Cache<Node, Map<Element, Sequence<Element>>>
>();

export function hasInterposedDescendant(device: Device): Predicate<Element> {
  return (element) => {
    const root = element.root({
      flattened: true,
    });

    return cache
      .get(device, Cache.empty)
      .get(root, () =>
        root
          .inclusiveDescendants({
            flattened: true,
          })
          // Find all absolutely positioned elements.
          .filter(
            and(
              isElement,
              and(isPositioned(device, "absolute", "fixed"), isVisible(device))
            )
          )
          // And store their offset parents.
          .collect((element) => getOffsetParent(element, device))
          .groupBy((element) => getOffsetParent(element, device).get())
      )
      .has(element);
  };
}
