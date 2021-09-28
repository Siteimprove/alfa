import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Namespace, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import {
  hasAttribute,
  hasCascadedStyle,
  isPositioned,
  isVisible,
} from "../common/predicate";

import { getOffsetParent } from "../common/expectation/get-offset-parent";

const { or, not, equals } = Predicate;
const { and, test } = Refinement;
const { isElement, hasNamespace } = Element;
const { isText } = Text;

export default Rule.Atomic.of<Page, Text>({
  uri: "https://alfa.siteimprove.com/rules/sia-r83",
  requirements: [Criterion.of("1.4.4")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return visit(document);

        function* visit(node: Node, collect: boolean = false): Iterable<Text> {
          if (
            test(
              and(
                isElement,
                or(
                  hasAttribute("aria-hidden", equals("true")),
                  not(hasNamespace(Namespace.HTML))
                )
              ),
              node
            )
          ) {
            return;
          }

          if (collect && test(and(isText, isVisible(device)), node)) {
            yield node;
          }

          if (
            isElement(node) &&
            (overflow(node, device, "x") === Overflow.Clip ||
              overflow(node, device, "y") === Overflow.Clip)
          ) {
            collect = true;
          }

          const children = node.children({ flattened: true, nested: true });

          for (const child of children) {
            yield* visit(child, collect);
          }
        }
      },

      expectations(target) {
        const parent = target
          .parent({ flattened: true, nested: true })
          .filter(isElement);

        const horizontalClip = parent.every(isHorizontallyClipping(device));

        const verticalClip = parent.every(isVerticallyClipping(device));

        return {
          1: expectation(
            horizontalClip || verticalClip,
            () => Outcomes.ClipsText,
            () => Outcomes.WrapsText
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const WrapsText = Ok.of(
    Diagnostic.of(`The text is wrapped without being clipped`)
  );

  export const ClipsText = Err.of(Diagnostic.of(`The text is clipped`));
}

const verticallyClippingCache = Cache.empty<Device, Cache<Element, boolean>>();
/**
 * Checks if an element clips its vertical overflow by having an ancestor with
 * both a fixed height and a clipping overflow (before any scrolling ancestor).
 *
 * Note that element with a fixed height will create an overflow anyway, and
 * that may be clipped by any other ancestor. However, it is a common pattern to
 * have `overflow: hidden` on the `<body>` element itself, given more than
 * enough space for these overflowing elements to grow. Hence, we stick to a
 * strict matching.
 */
function isVerticallyClipping(device: Device): Predicate<Element> {
  return function isClipping(element: Element): boolean {
    return verticallyClippingCache.get(device, Cache.empty).get(element, () => {
      if (
        hasFixedHeight(device)(element) &&
        overflow(element, device, "y") === Overflow.Clip
      ) {
        return true;
      }

      if (overflow(element, device, "y") === Overflow.Handle) {
        return false;
      }

      return getRelevantParent(element, device).some(isClipping);
    });
  };
}

/**
 * Checks if an element ultimately clips its horizontal overflow:
 * * all elements are assumed to have fixed width because the page cannot extend
 *   infinitely in the horizontal dimension;
 * * first we look at the element itself and how it handles the text overflow of
 *   its children text nodes;
 * * if text overflows its parent, it does so as content, so we look for an
 *   ancestor that either handles it (scroll bar) or clips it.
 */
function isHorizontallyClipping(device: Device): Predicate<Element> {
  return (element) => {
    switch (horizontalTextOverflow(element, device)) {
      case Overflow.Clip:
        return true;
      case Overflow.Handle:
        return false;
      case Overflow.Overflow:
        return getRelevantParent(element, device).some(
          isHorizontallyClippingOverflow(device)
        );
    }
  };
}

const horizontallyClippingCache = Cache.empty<
  Device,
  Cache<Element, boolean>
>();
/**
 * Checks whether the first offset ancestor that doesn't overflow is
 * clipping.
 *
 * When encountering an ancestor which is a wrapping flex container, we assume
 * that this ancestor is correctly wrapping all its children and that no
 * individual child overflows enough to overflow the parent (when alone on a
 * line). This is not fully correct (since an individual child might overflow
 * enough that it would overflow the flex-wrapping ancestor even if alone on a
 * line); but this seems to be a frequent use case.
 */
function isHorizontallyClippingOverflow(device: Device): Predicate<Element> {
  return function isClipping(element: Element): boolean {
    return horizontallyClippingCache
      .get(device, Cache.empty)
      .get(element, () => {
        if (isWrappingFlexContainer(device)(element)) {
          // The element handles overflow by wrapping its flex descendants
          return false;
        }
        switch (overflow(element, device, "x")) {
          case Overflow.Clip:
            return true;
          case Overflow.Handle:
            return false;
          case Overflow.Overflow:
            return getRelevantParent(element, device).some(isClipping);
        }
      });
  };
}

enum Overflow {
  Clip, // The element clips its overflow.
  Handle, // The element definitely handles its overflow.
  Overflow, // The element overflows into its parent.
}

function overflow(
  element: Element,
  device: Device,
  dimension: "x" | "y"
): Overflow {
  switch (
    Style.from(element, device).computed(`overflow-${dimension}`).value.value
  ) {
    case "clip":
    case "hidden":
      return Overflow.Clip;
    case "scroll":
    case "auto":
      return Overflow.Handle;
    case "visible":
      return Overflow.Overflow;
  }
}

/**
 * Checks how an element handle its text overflow (overflow of its children
 * text nodes).
 */
function horizontalTextOverflow(element: Element, device: Device): Overflow {
  const style = Style.from(element, device);

  const { value: whitespace } = style.computed("white-space");

  if (whitespace.value !== "nowrap" && whitespace.value !== "pre") {
    // Whitespace causes wrapping, the element doesn't overflow its text.
    return Overflow.Handle;
  }
  // If whitespace does not cause wrapping, we need to check if a text
  // overflow occurs and could cause the text to clip.
  switch (overflow(element, device, "x")) {
    case Overflow.Overflow:
      // The text always overflow into the parent, parent needs to handle an
      // horizontal content overflow
      return Overflow.Overflow;
    case Overflow.Handle:
      // The element handles its text overflow with a scroll bar
      return Overflow.Handle;
    case Overflow.Clip:
      // The element clip its overflow, but maybe `text-overflow` handles it.
      const { value: overflow } = style.computed("text-overflow");
      // We assume that anything other than `clip` handles the overflow.
      return overflow.value === "clip" ? Overflow.Clip : Overflow.Handle;
  }
}

function hasFixedHeight(device: Device): Predicate<Element> {
  return hasCascadedStyle(
    "height",
    (height, source) =>
      height.type === "length" &&
      height.value > 0 &&
      !height.isFontRelative() &&
      source.some((declaration) => declaration.parent.isSome()),
    device
  );
}

function getRelevantParent(element: Element, device: Device): Option<Element> {
  return isPositioned(device, "static")(element)
    ? element.parent({ flattened: true }).filter(isElement)
    : getOffsetParent(element, device);
}

function isWrappingFlexContainer(device: Device): Predicate<Element> {
  return (element) => {
    const style = Style.from(element, device);
    const {
      value: { values: display },
    } = style.computed("display");

    if (display[1]?.value === "flex") {
      // The element is a flex container
      const { value: flexWrap } = style.computed("flex-wrap");
      return flexWrap.value !== "nowrap";
    }

    return false;
  };
}
