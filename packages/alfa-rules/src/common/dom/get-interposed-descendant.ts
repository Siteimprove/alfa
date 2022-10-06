import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

const { isElement } = Element;
const { and } = Refinement;
const { getOffsetParent, isPositioned, isVisible } = Style;

// For each device and document's root, we store a map from the offset parents
// to its interposed descendants.
// Due to the definition of offset parent, searching a subtree rooted at element
// can easily find interposed descendants of *other* elements. In order to not
// waste the time spent to find them, it is simpler to fill the cache for a full
// document tree at once.
// Since offset parents stay within the same document, there is no need to
// escape document boundaries.
const cache = Cache.empty<
  Device,
  Cache<Node, Map<Element, Sequence<Element>>>
>();

export function getInterposedDescendant(
  device: Device,
  element: Element
): Sequence<Element> {
  const root = element.root(Node.flatTree);

  return cache
    .get(device, Cache.empty)
    .get(root, () =>
      root
        .inclusiveDescendants(Node.flatTree)
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
        // getOffsetParent is guaranteed to be Some by the previous filter.
        .groupBy((element) => getOffsetParent(element, device).getUnsafe())
    )
    .get(element)
    .getOr(Sequence.empty());
}
