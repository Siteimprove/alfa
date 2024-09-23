import { Cache } from "@siteimprove/alfa-cache";
import { Numeric } from "@siteimprove/alfa-css";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Context } from "@siteimprove/alfa-selector";

import { hasComputedStyle } from "../../element/predicate/has-computed-style.js";
import { isPositioned } from "../../element/predicate/is-positioned.js";
import { hasSameForegroundAsBackground } from "./has-same-foreground-as-background.js";

import { isClipped } from "./is-clipped.js";
import { isOffscreen } from "./is-offscreen.js";
import { isOptionHidden } from "./is-option-hidden.js";
import { isRendered } from "./is-rendered.js";
import { isTransparent } from "./is-transparent.js";

const { hasName, isElement, isReplaced } = Element;
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

const cache = Cache.empty<Device, Cache<Context, Cache<Node, boolean>>>();

function isInvisible(
  device: Device,
  context: Context = Context.empty(),
): Predicate<Node> {
  return (node) =>
    cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
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
                  context,
                ),
              ),
            ),
            // Element or Text with visibility != "visible"
            and(
              or(isElement, isText),
              hasComputedStyle(
                "visibility",
                (visibility) => visibility.value !== "visible",
                device,
                context,
              ),
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
                    .every(isInvisible(device, context)),
              ),
            ),
            // `<option>` elements (and their content) have weird visibility
            // rules depending on their `<select>` parent.
            // (only text is allowed as children of `<option>`, this also works
            // on ill-formed DOM trees where the text is buried deeper)
            isOptionHidden(device),
          ),
          node,
        ),
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
 * @remarks
 * For each direction (x / y), we look if the element either has a set dimension
 * (width / height), or is stretched after being absolutely positioned.
 * An element has a set dimension if its value is a numeric value (not a keyword)
 * larger than 0.
 * An element is stretched if it has both end points (left+right / top+bottom)
 * to a non-`auto` value.
 *
 * If an element has dimension in both directions, it is assumed to be visible.
 *
 * width / height keyword value are auto, max-content, min-content, and
 * fit-content; all of them depend on content and do not stretch empty elements.
 *
 * This does **not** look at layout information. We are here searching for
 * author's intention to stretch the element (presumably to use it as a background
 * or background image), not for elements that the UA happens to stretch (these
 * should be visible due to visible content that caused them to stretch in the
 * first place).
 */
function hasDimensions(device: Device): Predicate<Element> {
  const hasDimension = (dimension: "height" | "width") =>
    hasComputedStyle(
      dimension,
      and(Numeric.isFixed, (number) => number.value > 0),
      device,
    );

  const isStretched = (...sides: ["top", "bottom"] | ["left", "right"]) =>
    and(
      isPositioned(device, "absolute"),
      hasComputedStyle(sides[0], Numeric.isNumeric, device),
      hasComputedStyle(sides[1], Numeric.isNumeric, device),
    );

  return and(
    or(hasDimension("height"), isStretched("top", "bottom")),
    or(hasDimension("width"), isStretched("left", "right")),
  );
}
