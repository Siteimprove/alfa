import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/act/expectation";

import { Scope, Version } from "../tags";

const { hasNamespace, isElement } = Element;
const { test } = Predicate;
const { and } = Refinement;
const { hasComputedStyle, hasSpecifiedStyle, isImportant, isVisible } = Style;
const { isText } = Text;

const property = "letter-spacing";
const threshold = 0.12;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r91",
  requirements: [Criterion.of("1.4.12")],
  tags: [Scope.Component, Version.of(2)],
  evaluate({ device, document }) {
    return {
      applicability() {
        return (
          document
            .descendants(Node.fullTree)
            .filter(and(isElement, hasNamespace(Namespace.HTML)))
            // We assume !important properties in style attribute are less frequent
            // than visible text node children, and filter in that order.
            .filter(
              and(
                // Specified value declared in a style attribute
                hasSpecifiedStyle(
                  property,
                  (_, source) =>
                    // A property is declared in a style attribute if
                    // its declaration has no parent style rule
                    source.some((declaration) => declaration.parent.isNone()),
                  device
                ),
                // Computed value important
                isImportant(device, property)
              )
            )
            // visible text node children
            .filter((element) =>
              element
                .children(Node.fullTree)
                .some(and(isText, isVisible(device)))
            )
        );
      },

      expectations(target) {
        return {
          1: expectation(
            test(
              hasComputedStyle(
                property,
                (value) =>
                  test(
                    hasComputedStyle(
                      "font-size",
                      (fontSize) => value.value >= threshold * fontSize.value,
                      device
                    ),
                    target
                  ),
                device
              ),
              target
            ),
            () => Outcomes.IsWideEnough,
            () => Outcomes.IsNotWideEnough
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsWideEnough = Ok.of(Diagnostic.of("Good"));

  export const IsNotWideEnough = Err.of(Diagnostic.of("Bad"));
}
