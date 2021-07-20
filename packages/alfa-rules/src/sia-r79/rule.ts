import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/expectation";

import { isRendered, isVisible } from "../common/predicate";
import { Predicate } from "@siteimprove/alfa-predicate";

const { hasName, isElement } = Element;
const { isText } = Text;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r79",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document

          .descendants({
            flattened: true,
            nested: true,
          })
          .filter(isElement)
          .filter(and(hasName("pre"), isRendered(device)));
      },

      expectations(target) {
        return {
          1: expectation(
            isVisible(device)(target),
            () => Outcomes.IsVisible,
            () =>
              expectation(
                target
                  .inclusiveAncestors({
                    flattened: true,
                    nested: true,
                  })
                  .filter(isElement)
                  .some((element) =>
                    aria.Node.from(element, device)
                      .attribute("aria-hidden")
                      .some((attribute) => attribute.value === "true")
                  ),
                () => Outcomes.IsHidden,
                () => Outcomes.IsNotVisibleAndNotHidden
              )
          ),
          2: expectation(
            target
              .ancestors({
                flattened: true,
                nested: true,
              })
              .filter(isElement)
              .some(hasName("figure")) || hasTextInsideAllowedElements(device)(target),
            () => Outcomes.IsDescendant,
            () => Outcomes.IsNotDescendant
          ),
        };
      },
    };
  },
});

function hasTextInsideAllowedElements(device: Device): Predicate<Node> {
  return function isGood(node: Node): boolean {
    if (and(isText, isVisible(device))(node)) {
      return false;
    }

    if (and(isElement, hasName("code", "kbd", "samp"))(node)) {
      return true;
    }

    return node
      .children({
        flattened: true,
        nested: true,
      })
      .every(isGood);
  };
}

export namespace Outcomes {
  export const IsVisible = Ok.of(Diagnostic.of(`The element is visible.`));

  export const IsHidden = Ok.of(
    Diagnostic.of(
      `One inclusive ancestor of the element has "aria-hidden = true."`
    )
  );

  export const IsDescendant = Ok.of(
    Diagnostic.of(
      `The target element either has a <figure> ancestor, or all its text is inside <code>, <kbd> or <samp> elements.`
    )
  );

  export const IsNotVisibleAndNotHidden = Err.of(
    Diagnostic.of(
      `The element is not visible and there isn't an inclusive ancestor with "aria-hidden" state.`
    )
  );

  export const IsNotDescendant = Err.of(
    Diagnostic.of(
      `The element has no <figure> ancestor and has text which not inside a <code>, <kbd> or <samp> element. `
    )
  );
}
