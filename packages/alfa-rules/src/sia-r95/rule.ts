import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { isVisible } from "../common/predicate/is-visible";
import { isTabbable } from "../common/predicate/is-tabbable";

const { isElement, hasName, hasNamespace, hasTabIndex } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r95.html",
  requirements: [Criterion.of("2.1.1")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ nested: true, flattened: true })
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
                .descendants({ flattened: true })
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
