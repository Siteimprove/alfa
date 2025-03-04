import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { type Element, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation, Question } from "../common/act/index.js";

import { Scope, Stability } from "../tags/index.js";

const { and } = Predicate;

const { hasNonEmptyAccessibleName, hasRole, isIncludedInTheAccessibilityTree } =
  DOM;

/**
 * This rule always asks Whether the heading is descriptive. This
 * is not a nice experience for the end user and shouldn't be used until
 * backend can automatically determine the answer.
 */
export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r115",
  requirements: [Criterion.of("2.4.6"), Technique.of("G130")],
  tags: [Scope.Component, Stability.Experimental],
  evaluate({ device, document }) {
    return {
      applicability() {
        return Query.getElementDescendants(document, Node.fullTree).filter(
          and(
            hasRole(device, "heading"),
            isIncludedInTheAccessibilityTree(device),
            hasNonEmptyAccessibleName(device),
          ),
        );
      },

      expectations(target) {
        return {
          1: Question.of("is-heading-descriptive", target).map((descriptive) =>
            expectation(
              descriptive,
              () => Outcomes.HeadingIsDescriptive,
              () => Outcomes.HeadingIsNotDescriptive,
            ),
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
  export const HeadingIsDescriptive = Ok.of(
    Diagnostic.of("This heading describes the content of the page"),
  );

  export const HeadingIsNotDescriptive = Err.of(
    Diagnostic.of("This heading does not describe the content of the page"),
  );
}
