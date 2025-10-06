import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Node, Query } from "@siteimprove/alfa-dom";
import { EAA } from "@siteimprove/alfa-eaa";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { isEmpty } = Iterable;
const { not, test } = Predicate;
const { hasId, hasUniqueId } = Element;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r3",
  requirements: [Criterion.of("4.1.1"), EAA.of("9.4.1.1"), Technique.of("H93")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.composedNested).filter(
          hasId(not(isEmpty)),
        );
      },

      expectations(target) {
        return {
          1: expectation(
            test(hasUniqueId, target),
            () => Outcomes.HasUniqueId,
            () => Outcomes.HasNonUniqueId,
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
  export const HasUniqueId = Ok.of(
    Diagnostic.of(`The element has a unique ID`),
  );

  export const HasNonUniqueId = Err.of(
    Diagnostic.of(`The element does not have a unique ID`),
  );
}
