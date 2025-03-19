import { DOM } from "@siteimprove/alfa-aria";
import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import type { Document } from "@siteimprove/alfa-dom";
import { Element, Node, Query, Text } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

import { getClickableRegion } from "../dom/get-clickable-region.js";

const { hasRole } = DOM;
const { hasComputedStyle, isFocusable, isScrolledBehind, isVisible } = Style;

const { and, not } = Predicate;

const { getElementDescendants } = Query;

const { isElement } = Element;
const { isText } = Text;

/**
 * @internal
 */
export const getApplicableTargets = Cache.memoize(function (
  document: Document,
  device: Device,
): Sequence<Element> {
  const isArea = (element: Element) => element.name === "area";
  const isBlock = hasComputedStyle(
    "display",
    (display) => display.values[0].value === "block",
    device,
  );
  const isInline = hasComputedStyle(
    "display",
    (display) => display.values[0].value === "inline",
    device,
  );

  let targets = Sequence.empty<Element>();

  function visit(node: Node, lineContainer: Option<Element>): void {
    if (isElement(node)) {
      if (
        and(isTarget(device), hasNonEmptyBoundingBox(device), not(isArea))(node)
      ) {
        // If the target is inline and there is a line container, don't add it or its descendants
        if (lineContainer.isSome() && isInline(node)) {
          return;
        }

        targets = targets.append(node);
      }

      if (isBlock(node)) {
        if (hasNonTargetText(device)(node)) {
          lineContainer = Option.of(node);
        } else {
          lineContainer = None;
        }
      }
    }

    for (const child of node.children(Node.fullTree)) {
      visit(child, lineContainer);
    }
  }

  visit(document, None);

  return targets;
});

/**
 * @internal
 *
 * @privateRemarks
 * This function is not used in the applicability of R111 or R113,
 * but in the expectation of R113 since all other targets are needed
 * to determine if an applicable target is underspaced.
 * It's kept here since it's closely related to the applicability.
 */
export const getAllTargets = Cache.memoize(
  (document: Document, device: Device): Sequence<Element> =>
    getElementDescendants(document, Node.fullTree).filter(
      and(isTarget(device), hasNonEmptyBoundingBox(device)),
    ),
);

/**
 * @internal
 */
export function isTarget(device: Device): Predicate<Element> {
  return and(
    hasComputedStyle(
      "pointer-events",
      (keyword) => keyword.value !== "none",
      device,
    ),
    isFocusable(device),
    isVisible(device),
    not(isScrolledBehind(device)),
    hasRole(device, (role) => role.isWidget()),
  );
}

function hasNonEmptyBoundingBox(device: Device): Predicate<Element> {
  return function (element) {
    const region = getClickableRegion(device, element);
    return Rectangle.union(...region).area > 0;
  };
}

const hasNonTargetText = Cache.memoize(function (
  device: Device,
): Predicate<Element> {
  return function (element) {
    if (and(isTarget(device), hasNonEmptyBoundingBox(device))(element)) {
      return false;
    }

    const children = element.children(Node.flatTree);
    return (
      children.some(and(isText, isVisible(device))) ||
      children
        .filter(isElement)
        .reject(and(isTarget(device), hasNonEmptyBoundingBox(device)))
        .some(hasNonTargetText(device))
    );
  };
});
