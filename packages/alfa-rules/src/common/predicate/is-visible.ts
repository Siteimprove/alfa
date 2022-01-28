import { Cache } from "@siteimprove/alfa-cache";
import { Keyword, Length, Percentage } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Node } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Context } from "@siteimprove/alfa-selector";

import {
  hasComputedStyle,
  isClipped,
  isOffscreen,
  isPositioned,
  isRendered,
  isReplaced,
  isTransparent,
} from "../predicate";

const { nor, not, or, test } = Predicate;
const { and } = Refinement;
const { hasName, isElement } = Element;
const { isText } = Text;

/**
 * Checks if a node is visible
 */
export function isVisible(device: Device, context?: Context): Predicate<Node> {
  return not(isInvisible(device, context));
}

const cache = Cache.empty<
  Device,
  Cache<Option<Context>, Cache<Node, boolean>>
>();

function isInvisible(device: Device, context?: Context): Predicate<Node> {
  return (node) =>
    cache
      .get(device, Cache.empty)
      .get(Option.from(context), Cache.empty)
      .get(node, () =>
        test(
          or(
            not(isRendered(device, context)),
            isTransparent(device, context),
            isClipped(device, context),
            isOffscreen(device, context),
            // Empty text
            and(isText, (text) => text.data.trim() === ""),
            // Text of size 0
            and(
              isText,
              hasComputedStyle(
                "font-size",
                (size) => size.value === 0,
                device,
                context
              )
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
              and(
                // If the element is replaced, visible when empty, or has set dimensions,
                // it is assumed to be visible
                nor(isReplaced, isVisibleWhenEmpty, hasDimensions(device)),
                // otherwise, the element is invisible iff all its children are.
                (element) =>
                  element
                    .children({
                      nested: true,
                      flattened: true,
                    })
                    .every(isInvisible(device, context))
              )
            )
          ),
          node
        )
      );
}

/**
 * Elements that are *not* "replaced elements" but are nonetheless visible when
 * empty
 */
const isVisibleWhenEmpty = hasName("textarea");

/**
 * Does the element have set dimensions?
 *
 * For each direction, we look if the element either has a set dimension,
 * or is stretched after being absolutely positioned; stretching only works when
 * the corresponding dimension is `auto`, but if it is not, then `hasDimension`
 * is true… (if the dimension is set to 0, isClipped handled the case)
 *
 * If an element has dimension in both directions, it is assumed to be visible.
 */
function hasDimensions(device: Device): Predicate<Element> {
  const isSet = (value: Keyword | Length | Percentage) =>
    value.type !== "keyword" && value.value > 0;

  const hasDimension = (dimension: "height" | "width") =>
    hasComputedStyle(dimension, isSet, device);

  const isStretched = (...sides: ["top", "bottom"] | ["left", "right"]) =>
    and(
      isPositioned(device, "absolute"),
      hasComputedStyle(sides[0], isSet, device),
      hasComputedStyle(sides[1], isSet, device)
    );

  return and(
    or(hasDimension("height"), isStretched("top", "bottom")),
    or(hasDimension("width"), isStretched("left", "right"))
  );
}
