import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";

const { and } = Refinement;
const { isElement } = Element;

import { getOffsetParent } from "../expectation/get-offset-parent";

import { isPositioned } from "./is-positioned";
import { isVisible } from "./is-visible";

// For each device and document's root, we store a map from the offset parents
// to its interposed descendants
const cache = Cache.empty<
  Device,
  Cache<Node, Map<Element, Sequence<Element>>>
>();

export function getInterposedDescendant(
  device: Device,
  element: Element
): Sequence<Element> {
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
        // Only keep the ones who have an offset parent
        .filter((element) => getOffsetParent(element, device).isSome())
        // Group the result by the offset parent
        // getOffsetParent is cached, so this is not expensive.
        // getOffsetParent is guaranteed to be Some by the previous collect.
        .groupBy((element) => getOffsetParent(element, device).get())
    )
    .get(element)
    .getOr(Sequence.empty());
}

export function hasInterposedDescendant(device: Device): Predicate<Element> {
  return (element) => !getInterposedDescendant(device, element).isEmpty();
}
