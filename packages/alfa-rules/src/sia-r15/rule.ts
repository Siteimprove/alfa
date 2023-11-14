import { Rule } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Element, Namespace, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";
import { Iterable } from "@siteimprove/alfa-iterable";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation";
import { Group } from "../common/act/group";
import { Question } from "../common/act/question";

import { referenceSameResource } from "../common/predicate";
import { Scope, Stability } from "../tags";

import { normalize } from "../common/normalize";
import { WithAccessibleName } from "../common/diagnostic";

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
            Node.from(iframe, device).name.map((name) => normalize(name.value)),
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

        const name = WithAccessibleName.getAccessibleName(
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
  export const EmbedSameResources = (accessibleName: string) =>
    Ok.of(
      WithAccessibleName.of(
        `The \`<iframe>\` elements embed the same resource`,
        accessibleName,
      ),
    );

  export const EmbedEquivalentResources = (accessibleName: string) =>
    Ok.of(
      WithAccessibleName.of(
        `The \`<iframe>\` elements embed equivalent resources`,
        accessibleName,
      ),
    );

  export const EmbedDifferentResources = (accessibleName: string) =>
    Err.of(
      WithAccessibleName.of(
        `The \`<iframe>\` elements do not embed the same or equivalent resources`,
        accessibleName,
      ),
    );
}
