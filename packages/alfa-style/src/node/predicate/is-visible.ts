import { Cache } from "@siteimprove/alfa-cache";
import { Numeric } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Node } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Context } from "@siteimprove/alfa-selector";

import { hasComputedStyle } from "../../element/predicate/has-computed-style";
import { isPositioned } from "../../element/predicate/is-positioned";
import { hasSameForegroundAsBackground } from "./has-same-foreground-as-background";

import { isClipped } from "./is-clipped";
import { isOffscreen } from "./is-offscreen";
import { isRendered } from "./is-rendered";
import { isTransparent } from "./is-transparent";

const { hasName, isElement, isReplaced } = Element;
const { isNumeric } = Numeric;
const { nor, not, test } = Predicate;
const { and, or } = Refinement;
const { isText } = Text;

/**
 * Checks if a node is visible
 *
 * @public
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
            and(
              isText,
              or(
                hasSameForegroundAsBackground(device, context),
                // Empty text
                (text) => text.data.trim() === "",
                // Text of size 0
                hasComputedStyle(
                  "font-size",
                  (size) => size.value === 0,
                  device,
                  context
                )
              )
            ),
            // Element or Text with visibility != "visible"
            and(
              or(isElement, isText),
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
                    .children(Node.fullTree)
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
 * For each direction (x / y), we look if the element either has a set dimension
 * (width / height), or is stretched after being absolutely positioned.
 * An element has a set dimension if its value is a numeric value (not a keyword)
 * larger than 0.
 * An element is stretched if it has both end points (left+right / top+bottom)
 * to a non-`auto` value.
 *
 * If an element has dimension in both directions, it is assumed to be visible.
 *
 * @remarks
 * width / height keyword value are auto, max-content, min-content, and
 * fit-content; all of them depend on content and do not stretch empty elements.
 */
function hasDimensions(device: Device): Predicate<Element> {
  const hasDimension = (dimension: "height" | "width") =>
    hasComputedStyle(
      dimension,
      and(isNumeric, (number) => number.value > 0),
      device
    );

  const isStretched = (...sides: ["top", "bottom"] | ["left", "right"]) =>
    and(
      isPositioned(device, "absolute"),
      hasComputedStyle(sides[0], isNumeric, device),
      hasComputedStyle(sides[1], isNumeric, device)
    );

  return and(
    or(hasDimension("height"), isStretched("top", "bottom")),
    or(hasDimension("width"), isStretched("left", "right"))
  );
}
