import { DOM } from "@siteimprove/alfa-aria";
import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

const { hasRole } = DOM;
const { hasComputedStyle, isFocusable } = Style;

const { and } = Predicate;
const { getElementDescendants } = Query;

const cache = Cache.empty<Document, Cache<Device, Sequence<Element>>>();

/**
 * @internal
 */
export function targetsOfPointerEvents(
  document: Document,
  device: Device,
): Sequence<Element> {
  return cache.get(document, Cache.empty).get(device, () =>
    getElementDescendants(document, Node.fullTree).filter(
      and(
        hasComputedStyle(
          "pointer-events",
          (keyword) => keyword.value !== "none",
          device,
        ),
        isFocusable(device),
        hasRole(device, (role) => role.isWidget()),
        (target) => target.getBoundingBox(device).isSome(),
      ),
    ),
  );
}
