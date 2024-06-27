import { Rule } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Element, Namespace, Query } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { String } from "@siteimprove/alfa-string";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation.js";
import { Group } from "../common/act/group.js";
import { Question } from "../common/act/question.js";

import { referenceSameResource } from "../common/predicate.js";
import { Scope, Stability } from "../tags/index.js";

import { WithName } from "../common/diagnostic.js";

const { hasNonEmptyAccessibleName, isIncludedInTheAccessibilityTree } = DOM;
const { hasName, hasNamespace } = Element;
const { and } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Group<Element>, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r15",
  requirements: [Criterion.of("4.1.2")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document, response }) {
    return {
      applicability() {
        return getElementDescendants(document, dom.Node.fullTree)
          .filter(
            and(
              hasName("iframe"),
              hasNamespace(Namespace.HTML),
              isIncludedInTheAccessibilityTree(device),
              hasNonEmptyAccessibleName(device),
            ),
          )
          .groupBy((iframe) =>
            Node.from(iframe, device).name.map((name) =>
              String.normalize(name.value),
            ),
          )
          .filter((elements) => elements.size > 1)
          .map(Group.of)
          .values();
      },

      expectations(target) {
        const embedSameResource = [...target].every(
          (element, i, elements) =>
            // This is either the first element...
            i === 0 ||
            // ...or an element that embeds the same resource as the element
            // before it.
            referenceSameResource(response.url)(element, elements[i - 1]),
        );

        const name = WithName.getName(
          Iterable.first(target).getUnsafe(), // Existence of first element is guaranteed by applicability
          device,
        ).getUnsafe(); // Existence of accessible name is guaranteed by applicability

        return {
          1: expectation(
            embedSameResource,
            () => Outcomes.EmbedSameResources(name),
            () =>
              Question.of(
                "reference-equivalent-resources",
                target,
                "Do the <iframe> elements embed equivalent resources?",
                {
                  diagnostic: WithName.of(
                    "Do the <iframe> elements embed equivalent resources?",
                    name,
                  ),
                },
              ).map((embedEquivalentResources) =>
                expectation(
                  embedEquivalentResources,
                  () => Outcomes.EmbedEquivalentResources(name),
                  () => Outcomes.EmbedDifferentResources(name),
                ),
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
  export const EmbedSameResources = (name: string) =>
    Ok.of(
      WithName.of(`The \`<iframe>\` elements embed the same resource`, name),
    );

  export const EmbedEquivalentResources = (name: string) =>
    Ok.of(
      WithName.of(`The \`<iframe>\` elements embed equivalent resources`, name),
    );

  export const EmbedDifferentResources = (name: string) =>
    Err.of(
      WithName.of(
        `The \`<iframe>\` elements do not embed the same or equivalent resources`,
        name,
      ),
    );
}
