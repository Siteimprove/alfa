import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { Scope } from "../tags";

const { equals } = Predicate;
const { hasAttribute, hasName, isElement } = Element;
const { and } = Refinement;
const { isRendered, isVisible } = Style;
const { isText } = Text;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r79",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document

          .descendants(Node.fullTree)
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
                  .inclusiveAncestors(Node.fullTree)
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

function hasOnlyAllowedText(device: Device): Predicate<Node> {
  return function hasOnlyAllowedText(node): boolean {
    // Any text within these elements is allowed and so we can stop recursing
    // when we encounter them.
    if (and(isElement, hasName("code", "kbd", "samp"))(node)) {
      return true;
    }

    // If we encounter a visible text node that isn't within one of the previous
    // elements then the text is not allowed.
    if (and(isText, isVisible(device))(node)) {
      return false;
    }

    // Otherwise, recursively check that the children only have allowed text.
    return node.children(Node.fullTree).every(hasOnlyAllowedText);
  };
}

function hasFigureAncestor(target: Element): boolean {
  return target
    .ancestors(Node.fullTree)
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
