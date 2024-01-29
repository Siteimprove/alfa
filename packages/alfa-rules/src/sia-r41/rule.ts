import { Rule } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Element, Namespace, Query } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation";
import { Group } from "../common/act/group";
import { Question } from "../common/act/question";

import { referenceSameResource } from "../common/predicate";

import { normalize } from "../common/normalize";

import { WithName } from "../common/diagnostic";
import { Scope, Stability } from "../tags";

const { hasNonEmptyAccessibleName, hasRole, isIncludedInTheAccessibilityTree } =
  DOM;
const { hasNamespace } = Element;
const { and } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Group<Element>, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r41",
  requirements: [Criterion.of("2.4.9")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document, response }) {
    return {
      applicability() {
        return getElementDescendants(document, dom.Node.fullTree)
          .filter(
            and(
              hasNamespace(Namespace.HTML, Namespace.SVG),
              hasRole(device, (role) => role.is("link")),
              isIncludedInTheAccessibilityTree(device),
              hasNonEmptyAccessibleName(device),
            ),
          )
          .groupBy((element) =>
            Node.from(element, device).name.map((name) =>
              normalize(name.value),
            ),
          )
          .filter((elements) => elements.size > 1)
          .map(Group.of)
          .values();
      },

      expectations(target) {
        const name = WithName.getName(
          Iterable.first(target).getUnsafe(), // Existence of first element is guaranteed by applicability
          device,
        ).getUnsafe(); // Existence of accessible name is guaranteed by applicability

        const embedSameResource = [...target].every((element, i, elements) => {
          // This is either the first element...
          return (
            i === 0 ||
            // ...or an element that embeds the same resource as the element
            // before it.
            referenceSameResource(response.url)(element, elements[i - 1])
          );
        });

        return {
          1: expectation(
            embedSameResource,
            () => Outcomes.ResolveSameResource(name),
            () =>
              Question.of(
                "reference-equivalent-resources",
                target,
                `Do the links resolve to equivalent resources?`,
                {
                  diagnostic: WithName.of(
                    `Do the links resolve to equivalent resources?`,
                    name,
                  ),
                },
              ).map((embedEquivalentResources) =>
                expectation(
                  embedEquivalentResources,
                  () => Outcomes.ResolveEquivalentResource(name),
                  () => Outcomes.ResolveDifferentResource(name),
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
  export const ResolveSameResource = (name: string) =>
    Ok.of(WithName.of(`The links resolve to the same resource`, name));

  export const ResolveEquivalentResource = (name: string) =>
    Ok.of(WithName.of(`The links resolve to equivalent resources`, name));

  export const ResolveDifferentResource = (name: string) =>
    Err.of(
      WithName.of(
        `The links do not resolve to the same or equivalent resources`,
        name,
      ),
    );
}
