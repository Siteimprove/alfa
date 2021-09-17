/// <reference lib="dom" />
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
import { normalize } from "../common/normalize";

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

        function* visit(
          node: Node,
          horizontal: boolean = false,
          vertical: boolean = false
        ): Iterable<Text> {
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

          if (
            (horizontal || vertical) &&
            test(and(isText, isVisible(device)), node)
          ) {
            if (horizontal) {
              horizontallyClippable.push(node);
            }

            if (vertical) {
              verticallyClippable.push(node);
            }

            yield node;
          }

          if (
            !horizontal &&
            isElement(node) &&
            overflow(node, device, "x") === Overflow.Clip
          ) {
            horizontal = true;
          }

          if (
            !vertical &&
            isElement(node) &&
            overflow(node, device, "y") === Overflow.Clip
          ) {
            vertical = true;
          }

          const children = node.children({ flattened: true, nested: true });

          for (const child of children) {
            yield* visit(child, horizontal, vertical);
          }
        }
      },

      expectations(target) {
        const isHorizontallyClipped =
          horizontallyClippable.find((text) => text.equals(target)) !==
            undefined &&
          target
            .parent({ flattened: true, nested: true })
            .every(and(isElement, horizontalClip(device)));

        const isVerticallyClipped =
          verticallyClippable.find((text) => text.equals(target)) !==
            undefined &&
          target
            .parent({ flattened: true, nested: true })
            .every(and(isElement, verticalClip(device)));

        return {
          1: expectation(
            isHorizontallyClipped || isVerticallyClipped,
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

function verticalClip(device: Device): Predicate<Element> {
  return (element) =>
    Sequence.of(
      element,
      Lazy.of(() => relevantAncestors(element, device))
    )
      .skipUntil(hasFixedHeight(device))
      .map((elt) => {
        return elt;
      })
      .skipWhile(
        (element) => overflow(element, device, "y") === Overflow.Overflow
      )
      .first()
      .some((element) => overflow(element, device, "y") === Overflow.Clip);
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

function horizontalClip(device: Device): Predicate<Element> {
  // The element itself may handle text overflow, otherwise we need to look for
  // a relevant ancestor that either handles or clips it.
  return (element) => {
    switch (horizontalTextOverflow(element, device)) {
      case Overflow.Clip:
        return true;
      case Overflow.Handle:
        return false;
      case Overflow.Overflow:
        return relevantAncestors(element, device)
          .skipWhile(
            (element) => overflow(element, device, "x") === Overflow.Overflow
          )
          .first()
          .some((element) => overflow(element, device, "x") === Overflow.Clip);
    }
  };
}
