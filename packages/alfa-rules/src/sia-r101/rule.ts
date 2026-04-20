import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import type { Device } from "@siteimprove/alfa-device";
import type { Document } from "@siteimprove/alfa-dom";
import { Element, Node, Query, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import type { Page } from "@siteimprove/alfa-web";

import { expectation, Question } from "../common/act/index.ts";

import { withDocumentElement } from "../common/applicability/with-document-element.ts";
import { Scope, Stability } from "../tags/index.ts";

const { hasRole, isIncludedInTheAccessibilityTree } = DOM;
const { isContent } = Element;
const { not } = Predicate;
const { and } = Refinement;

/**
 * This rule asks whether the page has repeated content before its main
 * content, unless it can automatically answer false when there is no
 * accessible content before the main element.
 */
export default Rule.Atomic.of<Page, Document, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r101",
  tags: [Scope.Page, Stability.Experimental],
  evaluate({ device, document }) {
    return {
      applicability() {
        return withDocumentElement(document);
      },

      expectations(target) {
        return {
          1: Question.of("has-repeated-content-before-main", target)
            .answerIf(hasNoContentBeforeMain(device), false)
            .map((hasRepeatedContent) =>
              expectation(
                !hasRepeatedContent,
                () => Outcomes.HasNoRepeatedContentBeforeMain,
                () => Outcomes.HasRepeatedContentBeforeMain,
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
  export const HasNoRepeatedContentBeforeMain = Ok.of(
    Diagnostic.of("The page has no repeated content before its main content"),
  );

  export const HasRepeatedContentBeforeMain = Err.of(
    Diagnostic.of("The page has repeated content before its main content"),
  );
}

function hasNoContentBeforeMain(device: Device): Predicate<Document> {
  return (document) => {
    const main = Query.getElementDescendants(document, Node.flatTree).find(
      hasRole(device, "main"),
    );

    if (!main.isSome()) {
      // There might be main content on the page, even if there is no main
      // element. In that case, we can't automatically answer if there is no
      // content before the main content.
      return false;
    }

    return !document
      .descendants(Node.flatTree)
      .takeUntil((node) => node.equals(main.get()))
      .some(
        and(
          isIncludedInTheAccessibilityTree(device),
          isContent(Node.flatTree),
          not(and(Text.isText, (text) => text.data.trim() === "")),
        ),
      );
  };
}
