import { DOM } from "@siteimprove/alfa-aria";
import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import type { Document } from "@siteimprove/alfa-dom";
import { Element, Node, Text, Query } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";

import { getClickableBox } from "../dom/get-clickable-box.js";

const { hasRole } = DOM;
const { hasComputedStyle, isFocusable, isVisible, isScrolledBehind } = Style;

const { and, not } = Predicate;

const { getElementDescendants } = Query;

const { isElement } = Element;
const { isText } = Text;

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
        if (and(isTarget(device), not(isArea))(node)) {
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
    isVisible(device),
    not(isScrolledBehind(device)),
    hasRole(device, (role) => role.isWidget()),
    hasClickableBox(device),
  );
}

function hasClickableBox(device: Device): Predicate<Element> {
  return (element) => getClickableBox(device, element).isOk();
}

const nonTargetTextCache = Cache.empty<Device, Cache<Element, boolean>>();

function hasNonTargetText(device: Device): Predicate<Element> {
  return (element) =>
    nonTargetTextCache.get(device, Cache.empty).get(element, () => {
      if (isTarget(device)(element)) {
        return false;
      }

      const children = element.children(Node.flatTree);
      return (
        children.some(and(isText, isVisible(device))) ||
        children
          .filter(isElement)
          .reject(isTarget(device))
          .some(hasNonTargetText(device))
      );
    });
}
