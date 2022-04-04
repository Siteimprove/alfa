import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Node as ariaNode } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/act/expectation";

import { hasRole, isIgnored, isPerceivable } from "../common/predicate";
import { Scope } from "../tags";

const { hasHeadingLevel } = DOM;
const { hasNamespace, isContent, isElement } = Element;
const { not } = Predicate;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r78",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    let headings: Sequence<Element>;

    return {
      applicability() {
        headings = document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              isElement,
              and(
                hasNamespace(Namespace.HTML),
                not(isIgnored(device)),
                hasRole(device, "heading")
              )
            )
          );

        return headings;
      },

      expectations(target) {
        const currentLevel = ariaNode
          .from(target, device)
          .attribute("aria-level")
          .map((level) => Number(level.value))
          .getOr(0);

        let end = false;

        const next = headings
          .skipUntil((heading) => heading.equals(target))
          .rest()
          .find(hasHeadingLevel(device, (level) => level <= currentLevel))
          // If there is no more heading with a small enough level,
          // go to the end of the document and record we did it
          .getOrElse(() => {
            end = true;

            return (
              document
                .descendants({ flattened: true, nested: true })
                .last()
                // The document contains at least the target.
                .get()
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
                isPerceivable(device),
                isContent({ flattened: true, nested: true })
              )
            ),
            () => Outcomes.hasContent,
            () => Outcomes.hasNoContent
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const hasContent = Ok.of(
    Diagnostic.of("There is content between this heading and the next")
  );

  export const hasNoContent = Err.of(
    Diagnostic.of("There is no content between this heading and the next")
  );
}
