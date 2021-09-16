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
  hasComputedStyle,
  hasNonWrappedText,
  isPositioned,
  isVisible,
} from "../common/predicate";

import { getOffsetParent } from "../common/expectation/get-offset-parent";

const { or, not, equals } = Predicate;
const { and, test } = Refinement;
const { isElement, hasNamespace } = Element;
const { isText } = Text;

const show = (_: string) => {};

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
            test(and(isElement, isPossiblyClippingHorizontally(device)), node)
          ) {
            horizontal = true;
          }

          if (
            !vertical &&
            isElement(node) &&
            verticalOverflow(node, device) === Overflow.Clip
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
        // show(`Horizontal: ${horizontallyClippable}`);
        // show(`Vertical: ${verticallyClippable}`);
        show(`Checking expectation for ${normalize(target.toString())}`);

        const isHorizontallyClipped =
          horizontallyClippable.find((text) => text.equals(target)) !==
            undefined &&
          target
            .parent({ flattened: true, nested: true })
            .every(and(isElement, isHorizontallyClipping(device)));

        const isVerticallyClipped =
          verticallyClippable.find((text) => text.equals(target)) !==
            undefined &&
          target
            .parent({ flattened: true, nested: true })
            .every(and(isElement, verticalClip(device)));
        // target
        //   .parent({ flattened: true, nested: true })
        //   .every(and(isElement, isVerticallyClipping(device)));

        show(`Horizontal Clip: ${isHorizontallyClipped}`);
        show(`Vertical Clip: ${isVerticallyClipped}`);

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

function isPossiblyClippingHorizontally(device: Device): Predicate<Element> {
  // If the element hides overflow along the x-axis, text might clip if it does
  // not wrap but instead continues along the x-axis.
  return and(
    hasComputedStyle(
      "overflow-x",
      (overflow) => overflow.value === "hidden" || overflow.value === "clip",
      device
    ),
    hasNonWrappedText(device)
  );
}

function isPossiblyClippingVertically(device: Device): Predicate<Element> {
  // The height of the element has been restricted using an non-font relative
  // length not set via the `style` attribute. In this case, text might clip
  // if overflow of the y-axis is hidden.
  //
  // For font relative heights we assume that care has already been taken to
  // ensure that the layout scales with the content.
  //
  // For heights set via the `style` attribute we assume that its value is
  // controlled by JavaScript and is adjusted as the content scales.
  //
  // Elements with `height: auto` may still have fixed length if their child has
  // i.e. we do not catch
  // <style>
  //  .clipping { overflow-y: clip }
  //  .fixed-height { height: 10px }
  // </style>
  // <div class="clipping"> <div class="fixed-height"></div> </div>
  // as possibly clipping. This only creates false negatives.
  return and(
    hasComputedStyle(
      "overflow-y",
      (overflow) => overflow.value === "hidden" || overflow.value === "clip",
      device
    ),
    // Use the cascaded value to avoid lengths being resolved to pixels.
    // Otherwise, we won't be able to tell if a font relative length was
    // used.
    hasCascadedStyle(
      "height",
      (height, source) =>
        height.type === "length" &&
        height.value > 0 &&
        !height.isFontRelative() &&
        source.some((declaration) => declaration.parent.isSome()),
      device
    )
  );
}

function isHorizontallyClipping(device: Device): Predicate<Element> {
  return (element) => {
    show(`Checking horizontal clip of ${normalize(element.toString())}`);

    if (isPossiblyClippingHorizontally(device)(element)) {
      show(
        `  ${normalize(element.toString())} is possibly clipping horizontally`
      );
      const result = isActuallyClippingHorizontally(element, device);
      show(
        `  ${normalize(element.toString())} is actually clipping? ${result}`
      );
      return result;
    }

    show(`  It doesn't possibly clips`);

    const relevantParent = isPositioned(device, "static")(element)
      ? element.parent().filter(isElement)
      : getOffsetParent(element, device);

    return relevantParent.every(isHorizontallyClipping(device));
  };
}

function hasHorizontalTextOverflow(device: Device): Predicate<Element> {
  return (element) => {
    const style = Style.from(element, device);

    const { value: whitespace } = style.computed("white-space");

    // If whitespace does not cause wrapping, we need to check if a text
    // overflow occurs and could cause the text to clip.
    if (whitespace.value === "nowrap" || whitespace.value === "pre") {
      const { value: x } = style.computed("overflow-x");

      const { value: overflow } = style.computed("text-overflow");

      // We assume that the text won't clip if the text overflow is handled
      // any other way than clip.
      return overflow.value === "clip";
    }

    // If whitespace causes wrapping, the element doesn't overflow its text.
    return false;
  };
}

function isActuallyClippingHorizontally(
  element: Element,
  device: Device
): boolean {
  const style = Style.from(element, device);

  const { value: whitespace } = style.computed("white-space");

  // If whitespace does not cause wrapping, we need to check if a text
  // overflow could cause the text to clip.
  if (whitespace.value === "nowrap") {
    const { value: overflow } = style.computed("text-overflow");

    // We assume that the text won't clip if the text overflow is handled
    // any other way than clip.
    return overflow.value === "clip";
  }

  // If whitespace does cause wrapping, the element doesn't clip.
  return false;
}

// function isHandlingHorizontalOverflow(device: Device): Predicate<Element> {
//   return (element) => {};
// }

function isVerticallyClipping(device: Device): Predicate<Element> {
  return (element) => {
    show(`Checking vertical clip of ${normalize(element.toString())}`);
    show(
      `overflow-y: ${Style.from(element, device).computed("overflow-y").value}`
    );
    if (isPossiblyClippingVertically(device)(element)) {
      show(`${normalize(element.toString())} is possibly clipping vertically`);
      return true;
    }

    if (isHandlingVerticalOverflow(device)(element)) {
      show(`${normalize(element.toString())} is handling vertical clipping`);
      return false;
    }

    const relevantParent = isPositioned(device, "static")(element)
      ? element.parent().filter(isElement)
      : getOffsetParent(element, device);

    // If there is no relevant parent, we've reached the root without finding
    // anything that clips, so nothing clips.
    return relevantParent.some(isVerticallyClipping(device));
  };
}

function isHandlingVerticalOverflow(device: Device): Predicate<Element> {
  // We assume that elements with a scrollbar correctly handle overflow.
  // This is not fully correct in case the scrolling element has larger height
  // than its clipping ancestor. This only creates false negative.
  return hasComputedStyle(
    "overflow-y",
    ({ value: overflow }) => overflow === "scroll" || overflow === "auto",
    device
  );
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

function verticalOverflow(element: Element, device: Device): Overflow {
  switch (Style.from(element, device).computed("overflow-y").value.value) {
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

function hasVerticallyClippedContent(device: Device): Predicate<Element> {
  return (element) => {
    switch (verticalOverflow(element, device)) {
      case Overflow.Clip:
        return true;
      case Overflow.Handle:
        return false;
      case Overflow.Overflow:
        return getOffsetParent(element, device).some(
          and(isElement, hasVerticallyClippedContent(device))
        );
    }
  };
}

function verticalClip(device: Device): Predicate<Element> {
  return (element) =>
    Sequence.of(
      element,
      Lazy.of(() => relevantAncestors(element, device))
    )
      .map((elt) => {
        show(`offset ancestor: ${normalize(elt.toString())}`);
        return elt;
      })
      .skipUntil(hasFixedHeight(device))
      .map((elt) => {
        show(`fixed height and later: ${normalize(elt.toString())}`);
        return elt;
      })
      .skipWhile(
        (element) => verticalOverflow(element, device) === Overflow.Overflow
      )
      .map((elt) => {
        show(`non overflowing and later: ${normalize(elt.toString())}`);
        return elt;
      })
      .first()
      .some((element) => verticalOverflow(element, device) === Overflow.Clip);
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
