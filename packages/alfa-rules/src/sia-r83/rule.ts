import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text, Namespace, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
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
  hasComputedStyle,
  hasNonWrappedText,
  isVisible,
} from "../common/predicate";

const { or, not, equals } = Predicate;
const { and, test } = Refinement;
const { isElement, hasName, hasNamespace } = Element;
const { isText } = Text;

export default Rule.Atomic.of<Page, Text>({
  uri: "https://alfa.siteimprove.com/rules/sia-r83",
  requirements: [Criterion.of("1.4.4")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return visit(document);

        function* visit(node: Node, collect = false): Iterable<Text> {
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

          if (test(and(isElement, isPossiblyClipping(device)), node)) {
            collect = true;
          }

          const children = node.children({ flattened: true, nested: true });

          for (const child of children) {
            yield* visit(child, collect);
          }
        }
      },

      expectations(target) {
        return {
          1: expectation(
            target
              .parent({ flattened: true, nested: true })
              .every(and(isElement, not(wrapsText(device)))),
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

function isPossiblyClipping(device: Device): Predicate<Element> {
  return or(
    isPossiblyClippingHorizontally(device),
    isPossiblyClippingVertically(device)
  );
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

function wrapsText(device: Device): Predicate<Element> {
  return (element) => {
    if (isPossiblyClipping(device)(element)) {
      return isActuallyClipping(element, device);
    }

    const relevantParent = isPositioned(device, "static")(element)
      ? element.parent().filter(isElement)
      : offsetParent(element, device);

    return relevantParent.every(wrapsText(device));
  };
}

function isPositioned(device: Device, position: string): Predicate<Element> {
  return hasComputedStyle(
    "position",
    (value) => value.value === position,
    device
  );
}

function isActuallyClipping(element: Element, device: Device): boolean {
  const style = Style.from(element, device);

  const { value: whitespace } = style.computed("white-space");

  // If whitespace does not cause wrapping, we need to check if a text
  // overflow could cause the text to clip.
  if (whitespace.value === "nowrap") {
    const { value: overflow } = style.computed("text-overflow");

    // We assume that the text won't clip if the text overflow is handled
    // any other way than clip.
    return overflow.value !== "clip";
  }

  return false;
}

function offsetParent(element: Element, device: Device): Option<Element> {
  if (or(hasName("body", "html"), isPositioned(device, "fixed"))(element)) {
    return None;
  }

  const ancestors = element
    .ancestors({
      flattened: true,
    })
    .filter(isElement);

  return ancestors
    .find(not(isPositioned(device, "static")))
    .orElse(() => ancestors.find(hasName("td", "th", "table")));
}
