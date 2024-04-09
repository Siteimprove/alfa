import { DOM } from "@siteimprove/alfa-aria";
import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";
import { Query } from "@siteimprove/alfa-dom";

const { hasRole } = DOM;
const { hasComputedStyle, isFocusable, isVisible } = Style;

const { and, not } = Predicate;

const { getElementDescendants } = Query;

const applicabilityCache = Cache.empty<
  Document,
  Cache<Device, Sequence<Element>>
>();

/**
 * @internal
 */
export function applicableTargetsOfPointerEvents(
  document: Document,
  device: Device,
): Sequence<Element> {
  return applicabilityCache.get(document, Cache.empty).get(device, () => {
    const isParagraph = hasRole(device, "paragraph");
    const isArea = (element: Element) => element.name === "area";

    function* visit(node: Node): Iterable<Element> {
      if (Element.isElement(node)) {
        if (isParagraph(node)) {
          // If we encounter a paragraph, we can skip the entire subtree
          return;
        }

        // TODO: It's not enough to reject paragraphs, we need to reject all text blocks in order to avoid false positives

        if (and(isTarget(device), isVisible(device), not(isArea))(node)) {
          yield node;
        }
      }

      for (const child of node.children(Node.fullTree)) {
        yield* visit(child);
      }
    }

    return Sequence.from(visit(document));
  });
}

const allTargetsCache = Cache.empty<
  Document,
  Cache<Device, Sequence<Element>>
>();

/**
 * @internal
 *
 * @privateRemarks
 * This function is not used in the applicability of R111 or R113,
 * but in the expectation of R113 since all other targets are needed
 * to determine if an applicable target is underspaced.
 * It's kept here since it's closely related to the applicability.
 */
export function allTargetsOfPointerEvents(
  document: Document,
  device: Device,
): Sequence<Element> {
  return allTargetsCache
    .get(document, Cache.empty)
    .get(device, () =>
      getElementDescendants(document, Node.fullTree).filter(isTarget(device)),
    );
}

function isTarget(device: Device): Predicate<Element> {
  return and(
    hasComputedStyle(
      "pointer-events",
      (keyword) => keyword.value !== "none",
      device,
    ),
    isFocusable(device),
    hasRole(device, (role) => role.isWidget()),
    hasBoundingBox(device),
  );
}

function hasBoundingBox(device: Device): Predicate<Element> {
  return (element) => element.getBoundingBox(device).isSome();
}
