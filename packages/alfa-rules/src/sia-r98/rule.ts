import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import type { Device } from "@siteimprove/alfa-device";
import type { Document } from "@siteimprove/alfa-dom";
import { Node, Query } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import type { Page } from "@siteimprove/alfa-web";

import { Iterable } from "@siteimprove/alfa-iterable";
import { expectation, Question } from "../common/act/index.ts";
import { withDocumentElement } from "../common/applicability/with-document-element.ts";
import { isAtTheStart } from "../common/predicate.ts";
import { Scope, Stability } from "../tags/index.ts";

const { hasRole, isIncludedInTheAccessibilityTree } = DOM;
const { isVisible } = Style;

/**
 * This rule asks which elements are the main landmarks of the page, then
 * checks whether any of them starts with a visible, accessible heading.
 */
export default Rule.Atomic.of<Page, Document, Question.Metadata, Node>({
  uri: "https://alfa.siteimprove.com/rules/sia-r98",
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
              Iterable.isEmpty(mains)
                ? Outcomes.HasNoMainContent
                : expectation(
                    Iterable.some(mains, (main) =>
                      hasHeadingAtStart(main, device),
                    ),
                    () => Outcomes.HasHeadingAtStartOfMainContent,
                    () => Outcomes.HasNoHeadingAtStartOfMainContent,
                  ),
            ),
        };
      },
    };
  },
});

function hasHeadingAtStart(main: Node, device: Device): boolean {
  return Query.getElementDescendants(main, Node.flatTree).some(
    (element) =>
      isVisible(device)(element) &&
      isIncludedInTheAccessibilityTree(device)(element) &&
      hasRole(device, "heading")(element) &&
      isAtTheStart(main, device)(element),
  );
}

/**
 * @public
 */
export namespace Outcomes {
  export const HasHeadingAtStartOfMainContent = Ok.of(
    Diagnostic.of("The page has a heading at the start of its main content"),
  );

  /**
   * Unlike R101, which passes vacuously when no main content is identified,
   * this rule fails: without any identified main content the expectation
   * "main content starts with a heading" cannot be satisfied.
   *
   * This follows a strict reading of the rule which states its expectation
   * in terms of existence of headings at the start of main content.
   */
  export const HasNoMainContent = Err.of(
    Diagnostic.of("The page has no main content"),
  );

  export const HasNoHeadingAtStartOfMainContent = Err.of(
    Diagnostic.of("The page has no heading at the start of its main content"),
  );
}
