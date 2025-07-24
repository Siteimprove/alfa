import { Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation, Question } from "../common/act/index.js";
import { WithName } from "../common/diagnostic/with-name.js";

import { Scope, Stability } from "../tags/index.js";

const { hasAccessibleName } = DOM;
const { isVisible } = Style;
const { hasName } = Element;
const { and, or } = Predicate;

/**
 * This rule always asks whether the image accessible name is descriptive. This
 * is not a nice experience for the end user and shouldn't be used until
 * backend can automatically determine the answer.
 */
export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r117",
  requirements: [
    Criterion.of("1.1.1"),
    Technique.of("G94"),
    Technique.of("G95"),
  ],
  tags: [Scope.Component, Stability.Experimental],
  evaluate({ device, document }) {
    return {
      /**
       * @remarks
       * In the ACT rule, an element is **not** applicable if it has an ancestor in the flat tree that is named from
       * author, or it is an img element where the current request's state is not completely available (e.g. if the image
       * doesn't exist).
       *
       * Regarding the first condition, we could recurse the DOM and stop descending as
       * soon as we encounter an element named from author. I'm not yet sure how to determine if an element is named
       * from author, but I think we can use `Name.source`.
       *
       * I don't think the second condition is possible to check in Alfa, and I'm not sure if we want
       * to ask a question about it.
       */
      applicability() {
        return Query.getElementDescendants(document, Node.fullTree).filter(
          and(
            or(hasName("img"), hasName("canvas"), hasName("svg")),
            isVisible(device),
            hasAccessibleName(device),
          ),
        );
      },

      expectations(target) {
        const accName = WithName.getName(target, device).getUnsafe(); // Existence of accessible name is guaranteed by applicability

        return {
          1: Question.of("is-image-accessible-name-descriptive", target).map(
            (descriptive) =>
              expectation(
                descriptive,
                () => Outcomes.ImageAccessibleNameIsDescriptive(accName),
                () => Outcomes.ImageAccessibleNameIsNotDescriptive(accName),
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
  export const ImageAccessibleNameIsDescriptive = (accName: string) =>
    Ok.of(WithName.of("This accessible name describes the image", accName));

  export const ImageAccessibleNameIsNotDescriptive = (accName: string) =>
    Err.of(
      WithName.of("This accessible name does not describe the image", accName),
    );
}
