import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Namespace, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Lazy } from "@siteimprove/alfa-lazy";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
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
    const horizontallyClippable: Array<Text> = [];
    const verticallyClippable: Array<Text> = [];

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
        const horizontalClip = target
          .parent({ flattened: true, nested: true })
          .every(and(isElement, isHorizontallyClipped(device)));

        const verticalClip = target
          .parent({ flattened: true, nested: true })
          .every(and(isElement, isVerticallyClipped(device)));

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

/**
 * Checks how an element handle its text overflow (overflow of its direct
 * children text nodes).
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
      // horizontal context overflow
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

/**
 * Checks if an element ultimately clips its vertical overflow:
 * * as long as no offset ancestor has a fixed height, elements can grow and
 *   no overflow actually occurs;
 * * once a fixed height ancestor is found, an overflow possibly occurs and we
 *   switch to finding an ancestor that either handles it (scroll bar) or
 *   clips it.
 */
function isVerticallyClipped(device: Device): Predicate<Element> {
  return (element) =>
    isClipping(
      Sequence.of(
        element,
        Lazy.of(() => relevantAncestors(element, device))
      ).skipUntil(hasFixedHeight(device)),
      device,
      "y"
    );
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
function isHorizontallyClipped(device: Device): Predicate<Element> {
  return (element) => {
    switch (horizontalTextOverflow(element, device)) {
      case Overflow.Clip:
        return true;
      case Overflow.Handle:
        return false;
      case Overflow.Overflow:
        return isClipping(relevantAncestors(element, device), device, "x");
    }
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

function relevantAncestors(
  element: Element,
  device: Device
): Sequence<Element> {
  for (const parent of getRelevantParent(element, device)) {
    return Sequence.of(
      parent,
      Lazy.of(() => relevantAncestors(parent, device))
    );
  }

  return Sequence.empty();
}

function getRelevantParent(element: Element, device: Device): Option<Element> {
  return isPositioned(device, "static")(element)
    ? element.parent({ flattened: true }).filter(isElement)
    : getOffsetParent(element, device);
}

/**
 * Checks whether the first element in the sequence that doesn't overflow is
 * clipping.
 */
function isClipping(
  sequence: Sequence<Element>,
  device: Device,
  dimension: "x" | "y"
): boolean {
  return sequence
    .skipWhile(
      (element) => overflow(element, device, dimension) === Overflow.Overflow
    )
    .first()
    .some((element) => overflow(element, device, dimension) === Overflow.Clip);
}
