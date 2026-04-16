import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Node, Query } from "@siteimprove/alfa-dom";
import { EAA } from "@siteimprove/alfa-eaa";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.ts";

import { Scope, Stability } from "../tags/index.ts";

const { isEmpty } = Iterable;
const { not, test } = Predicate;
const { hasId, hasUniqueId } = Element;
const { getElementDescendants } = Query;

/**
 * @deprecated
 * This rule has been deprecated because Success Criterion 4.1.1 has been
 * removed from WCAG 2.2 and is considered always passing for HTML pages in
 * WCAG 2.1.
 */
export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r3",
  requirements: [Criterion.of("4.1.1"), EAA.of("9.4.1.1"), Technique.of("H93")],
  tags: [Scope.Component, Stability.Deprecated],
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
