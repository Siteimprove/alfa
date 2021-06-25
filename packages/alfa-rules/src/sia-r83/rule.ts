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

import { hasAttribute } from "../common/predicate/has-attribute";
import { isVisible } from "../common/predicate/is-visible";

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

          if (test(and(isElement, isPossiblyClipped(device)), node)) {
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
            wrapsText(device)(target),
            () => Outcomes.WrapsText,
            () => Outcomes.ClipsText
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

function isPossiblyClipped(device: Device): Predicate<Element> {
  return (element) => {
    const style = Style.from(element, device);

    // Case 1: Words never wrap and will continue to expand along the x-axis.
    // In this case, text might clip if overflow of the x-axis is hidden.
    if (
      style
        .computed("white-space")
        .some((whiteSpace) => whiteSpace.value === "nowrap")
    ) {
      return style
        .computed("overflow-x")
        .some(
          (overflow) => overflow.value === "hidden" || overflow.value === "clip"
        );
    }

    // Case 2: The height of the element has been restricted using an non-font
    // relative length not set via the `style` attribute. In this case,
    // text might clip if overflow of the y-axis is hidden.
    //
    // For font relative heights we assume that care has already been taken to
    // ensure that the layout scales with the content.
    //
    // For heights set via the `style` attribute we assume that its value is
    // controlled by JavaScript and is adjusted as the content scales.
    if (
      style
        // Use the cascaded value to avoid lengths being resolved to pixels.
        // Otherwise, we won't be able to tell if a font relative length was
        // used.
        .cascaded("height")
        .some((height) =>
          height.some(
            (height, source) =>
              height.type === "length" &&
              height.value > 0 &&
              !height.isFontRelative() &&
              source.some((declaration) => declaration.parent.isSome())
          )
        )
    ) {
      return style
        .computed("overflow-y")
        .some(
          (overflow) => overflow.value === "hidden" || overflow.value === "clip"
        );
    }

    return false;
  };
}

function wrapsText(device: Device): Predicate<Text> {
  return (text) => {
    const array = text
      .ancestors({
        flattened: true,
      })
      .filter(isElement);

    for (const ancestor of array) {
      if (staticallyPositioned(device)(ancestor)) {
        if (isPossiblyClipped(device)(ancestor)) {
          return isActuallyClipping(ancestor, device);
        }
      }
    }

    return true;
  };
}

function foo(element: Element, device: Device): boolean {
  if (isPossiblyClipped(device)(element)) {
    return isActuallyClipping(element, device);
  }

  let relevantParent: Option<Element> = None;
  if (staticallyPositioned(device)(element)) {
    relevantParent = element.parent().filter(isElement);
  } else {
    relevantParent = offsetParent(element, device);
  }
  // foo is not called with the correct type -> check that
  if (relevantParent.isSome()) {
    return foo(relevantParent.get(), device);
  } else {
    return true;
  }
}

function staticallyPositioned(device: Device): Predicate<Element> {
  return (element) =>
    Style.from(element, device).computed("position").value.value === "static";
}

function fixedPositioned(device: Device): Predicate<Element> {
  return (element) =>
    Style.from(element, device).computed("position").value.value === "fixed";
}

const isActuallyClipping = (element: Element, device: Device) => {
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
};

function offsetParent(element: Element, device: Device): Option<Element> {
  if (or(hasName("body", "html"), fixedPositioned(device))(element)) {
    return None;
  }

  const ancestors = element
    .ancestors({
      flattened: true,
    })
    .filter(isElement);

  return ancestors
    .find(not(staticallyPositioned(device)))
    .orElse(() => ancestors.find(hasName("td", "th", "table")));
}
