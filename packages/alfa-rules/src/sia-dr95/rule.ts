import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { WithBadElements } from "../common/diagnostic/with-bad-elements";

import { Scope, Stability } from "../tags";

const { isElement, hasName, hasNamespace, hasTabIndex } = Element;
const { and } = Predicate;
const { isTabbable, isVisible } = Style;

/**
 * @deprecated Use rule version 2 instead.
 */
export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r95",
  requirements: [Criterion.of("2.1.1")],
  tags: [Scope.Component, Stability.Deprecated],
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
        const tabbable = target.content
          .map((contentDocument) =>
            contentDocument
              .descendants(Node.flatTree)
              .filter(isElement)
              .filter(and(isVisible(device), isTabbable(device)))
          )
          .getOr(Sequence.empty());

        return {
          1: expectation(
            tabbable.isEmpty(),
            () => Outcomes.HasNoInteractiveElement,
            () => Outcomes.HasInteractiveElement(tabbable)
          ),
        };
      },
    };
  },
});

/**
 * @public
 */
export namespace Outcomes {
  export const HasNoInteractiveElement = Ok.of(
    Diagnostic.of(`The iframe contains no interactive element`)
  );

  export const HasInteractiveElement = (errors: Iterable<Element>) =>
    Err.of(
      WithBadElements.of(`The iframe contains some interactive element`, errors)
    );
}
