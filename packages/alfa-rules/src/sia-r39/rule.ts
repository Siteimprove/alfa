import { Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";
import { Question } from "../common/act/question.js";

import { WithName } from "../common/diagnostic.js";
import { Scope, Stability } from "../tags/index.js";

const { hasAccessibleName, isIncludedInTheAccessibilityTree } = DOM;
const { hasInputType, hasName, hasNamespace } = Element;
const { and, or, test } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r39",
  requirements: [
    Criterion.of("1.1.1"),
    Technique.of("G94"),
    Technique.of("G95"),
  ],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.HTML),
            or(hasName("img"), and(hasName("input"), hasInputType("image"))),
            isIncludedInTheAccessibilityTree(device),
            (element) =>
              test(
                hasAccessibleName(device, (accessibleName) =>
                  element
                    .attribute("src")
                    .map((attr) => getFilename(attr.value))
                    .some(
                      (filename) =>
                        filename.toLowerCase() ===
                        accessibleName.value.toLowerCase().trim(),
                    ),
                ),
                element,
              ),
          ),
        );
      },

      expectations(target) {
        const accName = WithName.getName(target, device).getUnsafe(); // Existence of accessible name is guaranteed by applicability

        return {
          1: Question.of(
            "name-describes-purpose",
            target,
            `Does the accessible name of the \`<${target.name}>\` element describe its purpose?`,
            {
              diagnostic: WithName.of(
                `Does the accessible name of the \`<${target.name}>\` element describe its purpose?`,
                accName,
              ),
            },
          ).map((nameDescribesPurpose) =>
            expectation(
              nameDescribesPurpose,
              () => Outcomes.NameIsDescriptive(target.name, accName),
              () => Outcomes.NameIsNotDescriptive(target.name, accName),
            ),
          ),
        };
      },
    };
  },
});

function getFilename(path: string): string {
  const base = path.substring(path.lastIndexOf("/") + 1);
  const params = base.indexOf("?");

  if (params !== -1) {
    return base.substring(0, params).trim();
  }

  return base.trim();
}

/**
 * @public
 */
export namespace Outcomes {
  export const NameIsDescriptive = (name: string, accName: string) =>
    Ok.of(
      WithName.of(
        `The accessible name of the \`<${name}>\` element describes its purpose`,
        accName,
      ),
    );

  export const NameIsNotDescriptive = (name: string, accName: string) =>
    Err.of(
      WithName.of(
        `The accessible name of the \`<${name}>\` element does not describe its purpose`,
        accName,
      ),
    );
}
