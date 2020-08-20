import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { Map } from "@siteimprove/alfa-map";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Set } from "@siteimprove/alfa-set";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";
import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/expectation";

import { hasNonEmptyAccessibleName } from "../common/predicate/has-non-empty-accessible-name";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

import { Question } from "../common/question";

const { isElement, hasNamespace, hasId } = Element;
const { map, flatMap } = Iterable;
const { and, not, equals } = Predicate;

export default Rule.Atomic.of<Page, Iterable<Element>, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r81.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        const elements = document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              isElement,
              and(
                hasNamespace(Namespace.HTML, Namespace.SVG),
                hasRole((role) => role.is("link")),
                not(isIgnored(device)),
                hasNonEmptyAccessibleName(device)
              )
            )
          );

        const groups = elements.groupBy((element) =>
          linkContext(element).add(element.root())
        );

        return flatMap(groups.values(), (elements) =>
          elements
            .reduce((groups, element) => {
              for (const [node] of aria.Node.from(element, device)) {
                const name = node.name.map((name) => name.value);

                groups = groups.set(
                  name,
                  groups
                    .get(name)
                    .getOrElse(() => List.empty<Element>())
                    .append(element)
                );
              }

              return groups;
            }, Map.empty<Option<string>, List<Element>>())
            .filter((elements) => elements.size > 1)
            .values()
        );
      },

      expectations(target) {
        const sources = Set.from(
          map(target, (element) =>
            element.attribute("href").map((attr) => attr.value)
          )
        );

        return {
          1: expectation(
            sources.size === 1,
            () => Outcomes.ResolveSameResource,
            () =>
              Question.of(
                "reference-equivalent-resources",
                "boolean",
                target,
                `Do the links resolve to equivalent resources?`
              ).map((embedEquivalentResources) =>
                expectation(
                  embedEquivalentResources,
                  () => Outcomes.ResolveEquivalentResource,
                  () => Outcomes.ResolveDifferentResource
                )
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const ResolveSameResource = Ok.of(
    Diagnostic.of(`The links resolve to the same resource`)
  );

  export const ResolveEquivalentResource = Ok.of(
    Diagnostic.of(`The links resolve to equivalent resources`)
  );

  export const ResolveDifferentResource = Err.of(
    Diagnostic.of(
      `The links do not resolve to the same or equivalent resources`
    )
  );
}

/**
 * @todo For links in table cells, account for the text in the associated table
 *       header cell.
 *
 * @see https://www.w3.org/TR/WCAG/#dfn-programmatically-determined-link-context
 */
function linkContext(element: Element): Set<dom.Node> {
  let context = Set.empty<dom.Node>();

  for (const listitem of element
    .ancestors({ flattened: true })
    .filter(and(isElement, hasRole("listitem")))) {
    context = context.add(listitem);
  }

  for (const paragraph of element
    .ancestors({ flattened: true })
    .find(and(isElement, Element.hasName("p")))) {
    context = context.add(paragraph);
  }

  for (const cell of element
    .ancestors({ flattened: true })
    .find(and(isElement, hasRole("cell", "gridcell")))) {
    context = context.add(cell);
  }

  for (const describedby of element.attribute("aria-describedby")) {
    for (const reference of element
      .root()
      .descendants()
      .filter(and(isElement, hasId(equals(...describedby.tokens()))))) {
      context = context.add(reference);
    }
  }

  return context;
}
