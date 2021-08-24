import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
//import { Set } from "@siteimprove/alfa-set";

import { expectation } from "../common/expectation";
import { isRendered, isVisible, hasAttribute } from "../common/predicate";

const { or, not, equals, test } = Predicate;
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
                  .some(hasAttribute("aria-hidden", equals("true"))),
                () => Outcomes.IsHidden,
                () => Outcomes.IsNotVisibleAndNotHidden
              )
          ),
          2: expectation(
            hasFigureAncestor(target) || hasOnlyAllowedText(device)(target),
            () => Outcomes.IsDescendant,
            () => Outcomes.IsNotDescendant
          ),
        };
      },
    };
  },
});

/*
function hasOnlyAllowedText(device: Device): Predicate<Element> {
  return (element) => {
    const isVisibleText = and(isText, isVisible(device));

    const allVisibleText = element.descendants().filter(isVisibleText);

    const allowedElements = element
      .descendants()
      .filter(and(isElement, hasName("code", "kbd", "samp")));

    const allowedText = allowedElements.flatMap((element) =>
      element.descendants().filter(isVisibleText)
    );

    const disallowedText = Set.from(allVisibleText).subtract(allowedText);

    return disallowedText.isEmpty();
  };
}
*/

function hasOnlyAllowedText(device: Device): Predicate<Node> {
  return function isNodeAllowed(node: Node): boolean {
    // checks if the node is an element and it has correct tags
    if (and(isElement, hasName("code", "kbd", "samp"))(node)) {
      return true;
    }
    // checks if the node is text and is set as visible
    if (and(isText, isVisible(device))(node)) {
      return false;
    }
    // else the function goes deeper in the tree checking the children
    return node
      .children({
        flattened: true,
        nested: true,
      })
      .every(isNodeAllowed);
  };
}

function hasFigureAncestor(target: Element): boolean {
  return target
    .ancestors({
      flattened: true,
      nested: true,
    })
    .filter(isElement)
    .some(hasName("figure"));
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
