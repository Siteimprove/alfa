import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Document, Element, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasHeadingLevel, hasRole, isIncludedInTheAccessibilityTree } = DOM;
const { isDocumentElement, isElement } = Element;
const { equals } = Predicate;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Document>({
  uri: "https://alfa.siteimprove.com/rules/sia-r61",
  tags: [Scope.Page],
  evaluate({ device, document }) {
    const firstHeading = document
      .descendants(Node.flatTree)
      .filter(and(isElement, isIncludedInTheAccessibilityTree(device)))
      .find(hasRole(device, "heading"));

    return {
      applicability() {
        return Node.hasChild(isDocumentElement)(document) &&
          firstHeading.isSome()
          ? [document]
          : [];
      },

      expectations(target) {
        return {
          1: expectation(
            hasHeadingLevel(device, equals(1))(firstHeading.get()),
            () => Outcomes.StartWithLevel1Heading,
            () => Outcomes.StartWithHigherLevelHeading
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const StartWithLevel1Heading = Ok.of(
    Diagnostic.of(`The document starts with a level 1 heading`)
  );

  export const StartWithHigherLevelHeading = Err.of(
    Diagnostic.of(`The document does not start with a level 1 heading`)
  );
}
