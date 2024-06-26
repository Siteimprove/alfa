import { Rule } from "@siteimprove/alfa-act";
import { DOM, Node as ariaNode } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Query, Text } from "@siteimprove/alfa-dom";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";
import { WithOtherHeading } from "../common/diagnostic.js";

import isText = Text.isText;

const { hasHeadingLevel, hasRole, isIncludedInTheAccessibilityTree } = DOM;
const { hasNamespace, isContent, isElement } = Element;
const { not, tee } = Predicate;
const { and } = Refinement;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r78",
  tags: [Scope.Page, Stability.Stable],
  evaluate({ device, document }) {
    let headings: Sequence<Element>;

    return {
      applicability() {
        headings = document.descendants(Node.fullTree).filter(
          and(
            isElement,
            and(
              hasNamespace(Namespace.HTML),
              isIncludedInTheAccessibilityTree(device),
              hasRole(device, "heading"),
              // Headings containing a button is the ARIA pattern for accordions.
              // Headings containing a link is frequently misused instead.
              // Headings containing a link is also used for, e.g., list of news.
              not((heading) =>
                getElementDescendants(heading).some(
                  hasRole(device, "button", "link"),
                ),
              ),
            ),
          ),
        );

        return headings;
      },

      expectations(target) {
        const currentLevel = ariaNode
          .from(target, device)
          .attribute("aria-level")
          .map((level) => Number(level.value))
          .getOr(0);

        let nextLevel = -1;
        let end = false;

        const next = headings
          .skipUntil((heading) => heading.equals(target))
          .rest()
          .find(
            hasHeadingLevel(
              device,
              tee(
                (level) => level <= currentLevel,
                (level, isLower) => {
                  if (isLower) {
                    nextLevel = level;
                  }
                },
              ),
            ),
          )
          // If there is no more heading with a small enough level,
          // go to the end of the document and record we did it
          .getOrElse(() => {
            end = true;

            return (
              document
                .descendants(Node.fullTree)
                .last()
                // The document contains at least the target.
                .getUnsafe()
            );
          });

        return {
          1: expectation(
            Node.getNodesBetween(target, next, {
              includeFirst: false,
              // If this is the last heading (of this level or less), then the
              // last node of the document is acceptable content; otherwise, the
              // next heading (of this level or less) is not acceptable content.
              includeSecond: end,
            }).some(
              and(
                isIncludedInTheAccessibilityTree(device),
                isContent(Node.fullTree),
                not(and(isText, (text) => text.data.trim() === "")),
              ),
            ),
            () =>
              Outcomes.hasContent(
                // The link between end nad the type of next is lost by TS
                end ? None : Some.of(next as Element),
                currentLevel,
                nextLevel,
              ),
            () =>
              Outcomes.hasNoContent(
                // The link between end nad the type of next is lost by TS
                end ? None : Some.of(next as Element),
                currentLevel,
                nextLevel,
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
  export const hasContent = (
    nextHeading: Option<Element>,
    currentLevel: number,
    nextLevel: number,
  ) =>
    Ok.of(
      WithOtherHeading.of(
        "There is content between this heading and the next",
        nextHeading,
        currentLevel,
        nextLevel,
        "next",
      ),
    );

  export const hasNoContent = (
    nextHeading: Option<Element>,
    currentLevel: number,
    nextLevel: number,
  ) =>
    Err.of(
      WithOtherHeading.of(
        "There is no content between this heading and the next",
        nextHeading,
        currentLevel,
        nextLevel,
        "next",
      ),
    );
}
