import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { isElement, hasName, hasNamespace, hasTabIndex } = Element;
const { and } = Predicate;
const { isTabbable, isVisible } = Style;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r95",
  requirements: [Criterion.of("2.1.1")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants(Node.fullTree)
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasName("iframe"),
              hasTabIndex((tabindex) => tabindex < 0)
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            target.content.every((contentDocument) =>
              contentDocument
                .descendants(Node.flatTree)
                .filter(isElement)
                .filter(and(isVisible(device), isTabbable(device)))
                .isEmpty()
            ),
            () => Outcomes.HasNoInteractiveElement,
            () => Outcomes.HasInteractiveElement
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasNoInteractiveElement = Ok.of(
    Diagnostic.of(`The iframe contains no interactive element`)
  );

  export const HasInteractiveElement = Err.of(
    Diagnostic.of(`The iframe contains some interactive element`)
  );
}
