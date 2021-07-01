import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Context } from "@siteimprove/alfa-selector";
import { Property, Style } from "@siteimprove/alfa-style";

import {
  hasComputedStyle,
  isClipped,
  isOffscreen,
  isRendered,
  isReplaced,
  isTransparent,
} from "../predicate";

const { nor, not, or } = Predicate;
const { and } = Refinement;
const { hasName, isElement } = Element;
const { isText } = Text;

/**
 * Checks if a node is visible
 */
export function isVisible(device: Device, context?: Context): Predicate<Node> {
  return not(isInvisible(device, context));
}

function isInvisible(device: Device, context?: Context): Predicate<Node> {
  return or(
    not(isRendered(device, context)),
    isTransparent(device, context),
    isClipped(device, context),
    isOffscreen(device, context),
    // Empty text
    and(isText, (text) => text.data.trim() === ""),
    // Text of size 0
    and(
      isText,
      hasComputedStyle("font-size", (size) => size.value === 0, device, context)
    ),
    // Element with visibility != "visible"
    and(
      isElement,
      hasComputedStyle(
        "visibility",
        (visibility) => visibility.value !== "visible",
        device,
        context
      )
    ),
    // Most non-replaced elements with no visible children are not visible while
    // replaced elements are assumed to be replaced by something visible. Some
    // non-replaced elements are, however, visible even when empty.
    and(
      isElement,
      and(nor(isReplaced, isVisibleWhenEmpty), (element) =>
        element
          .children({
            nested: true,
            flattened: true,
          })
          .every(isInvisible(device, context))
      )
    )
  );
}

/**
 * Elements that are *not* "replaced elements" but are nonetheless visible when
 * empty
 */
const isVisibleWhenEmpty = hasName("textarea");
