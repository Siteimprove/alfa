import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import type { Device } from "@siteimprove/alfa-device";
import type { Document } from "@siteimprove/alfa-dom";
import { Element, Node, Query, Text } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { String } from "@siteimprove/alfa-string";
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
 *
 * It tries to locate the main landmarks (elements with role of main),
 * and asks a question if it doesn't find any.
 */
export default Rule.Atomic.of<Page, Document, Question.Metadata, Node>({
  uri: "https://alfa.siteimprove.com/rules/sia-r101",
  tags: [Scope.Page, Stability.Experimental],
  evaluate({ device, document }) {
    return {
      applicability() {
        return withDocumentElement(document);
      },

      expectations(target) {
        const mains = Query.getElementDescendants(
          document,
          Node.flatTree,
        ).filter(hasRole(device, "main"));

        return {
          1: Question.of("main-landmark-elements", target)
            .answerIf(!mains.isEmpty(), mains)
            .map((mains) =>
              Iterable.first(mains)
                .map((main) =>
                  Question.of("has-repeated-content-before-main", main, target)
                    .answerIf(
                      hasNoAccessibleContentBefore(device, document),
                      false,
                    )
                    .map((hasRepeatedContent) =>
                      expectation(
                        !hasRepeatedContent,
                        () => Outcomes.HasNoRepeatedContentBeforeMain,
                        () => Outcomes.HasRepeatedContentBeforeMain,
                      ),
                    ),
                )
                .getOr(Outcomes.HasNoMainContent),
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
  export const HasNoMainContent = Ok.of(
    Diagnostic.of("The page has no main content"),
  );

  export const HasNoRepeatedContentBeforeMain = Ok.of(
    Diagnostic.of("The page has no repeated content before its main content"),
  );

  export const HasRepeatedContentBeforeMain = Err.of(
    Diagnostic.of("The page has repeated content before its main content"),
  );
}

function hasNoAccessibleContentBefore(
  device: Device,
  document: Document,
): Predicate<Node> {
  return (main) =>
    !document
      .descendants(Node.flatTree)
      .takeUntil((node) => node.equals(main))
      .some(
        and(
          isIncludedInTheAccessibilityTree(device),
          isContent(Node.flatTree),
          not(and(Text.isText, Text.is(String.isWhitespace))),
        ),
      );
}
