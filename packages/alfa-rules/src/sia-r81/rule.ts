import { Rule } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import type { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Query } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";
import { String } from "@siteimprove/alfa-string";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation.js";
import { Group } from "../common/act/group.js";
import { Question } from "../common/act/question.js";

import { referenceSameResource } from "../common/predicate.js";

import { WithName } from "../common/diagnostic.js";
import { Scope, Stability } from "../tags/index.js";

const { hasNonEmptyAccessibleName, hasRole, isIncludedInTheAccessibilityTree } =
  DOM;
const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;
const { getElementDescendants, getElementIdMap } = Query;

export default Rule.Atomic.of<Page, Group<Element>, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r81",
  requirements: [Criterion.of("2.4.4"), Criterion.of("2.4.9")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document, response }) {
    return {
      applicability() {
        // Links with identical names may appear in different contexts.
        // This creates two separate targets and we must take care of not
        // colliding them.
        const map = getElementDescendants(document, dom.Node.fullTree)
          .filter(
            and(
              hasNamespace(Namespace.HTML, Namespace.SVG),
              hasRole(device, (role) => role.is("link")),
              isIncludedInTheAccessibilityTree(device),
              hasNonEmptyAccessibleName(device),
            ),
          )
          // Group by contexts (context => group)
          .groupBy((element) => linkContext(element, device))
          // Group by names inside the contexts (context => [name => group])
          .map((elements) =>
            elements.groupBy((element) =>
              Node.from(element, device).name.map((name) =>
                String.normalize(name.value),
              ),
            ),
          );

        // Drop the context and name keys
        const groups = Sequence.from(
          Iterable.flatMap(map.values(), (map) => map.values()),
        );

        // Only keep the groups with more than one element
        return groups.filter((links) => links.size > 1).map(Group.of);
      },

      expectations(target) {
        const name = WithName.getName(
          Iterable.first(target).getUnsafe(), // Existence of first element is guaranteed by applicability
          device,
        ).getUnsafe(); // Existence of accessible name is guaranteed by applicability

        const embedSameResource = [...target].every(
          (element, i, elements) =>
            // This is either the first element...
            i === 0 ||
            // ...or an element that embeds the same resource as the element
            // before it.
            referenceSameResource(response.url)(element, elements[i - 1]),
        );

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

/**
 * @todo For links in table cells, account for the text in the associated table
 *       header cell.
 *
 * {@link https://www.w3.org/TR/WCAG/#dfn-programmatically-determined-link-context}
 */
function linkContext(element: Element, device: Device): Set<dom.Node> {
  let context = Set.empty<dom.Node>();

  const ancestors = element.ancestors(dom.Node.fullTree).filter(isElement);

  for (const listitem of ancestors.filter(hasRole(device, "listitem"))) {
    context = context.add(listitem);
  }

  for (const paragraph of ancestors.find(hasName("p"))) {
    context = context.add(paragraph);
  }

  for (const cell of ancestors.find(hasRole(device, "cell", "gridcell"))) {
    context = context.add(cell);
  }

  const idMap = getElementIdMap(element.root());
  for (const describedby of element.attribute("aria-describedby")) {
    for (const reference of describedby
      .tokens()
      .collect((id) => idMap.get(id))) {
      context = context.add(reference);
    }
  }

  return context;
}
