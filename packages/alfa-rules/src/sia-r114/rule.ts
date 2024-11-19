import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace, Query } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation, Question } from "../common/act/index.js";

import { Scope, Stability } from "../tags/index.js";

const { and } = Refinement;

const { hasName, hasNamespace } = Element;
/**
 * This rule always asks Whether the `<title>` of the page is descriptive. This
 * is not a nice experience for the end user and shouldn't be used until
 * backend can automatically determine the answer.
 */
export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r114",
  requirements: [
    Criterion.of("2.4.2"),
    Technique.of("G88"),
    Technique.of("H25"),
  ],
  tags: [Scope.Page, Stability.Experimental],
  evaluate({ document }) {
    return {
      applicability() {
        return Query.getElementDescendants(document).find(
          and(hasNamespace(Namespace.HTML), hasName("title")),
        );
      },

      expectations(target) {
        return {
          1: Question.of("is-title-descriptive", target).map((descriptive) =>
            expectation(
              descriptive,
              () => Outcomes.TitleIsDescriptive,
              () => Outcomes.TitleIsNotDescriptive,
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
  export const TitleIsDescriptive = Ok.of(
    Diagnostic.of("This `<title>` describes the content of the page"),
  );

  export const TitleIsNotDescriptive = Err.of(
    Diagnostic.of("This `<title>` does not describe the content of the page"),
  );
}
