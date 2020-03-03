import { Rule } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { Map } from "@siteimprove/alfa-map";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Set } from "@siteimprove/alfa-set";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

import { Question } from "../common/question";

const { map, flatMap, isEmpty } = Iterable;
const { and, or, not, equals } = Predicate;

export default Rule.Atomic.of<Page, Iterable<Element>, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r41.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        const elements = document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              Element.isElement,
              and(
                hasNamespace(equals(Namespace.HTML, Namespace.SVG)),
                and(
                  hasRole(
                    or(hasName(equals("link")), role =>
                      role.inheritsFrom(hasName(equals("link")))
                    )
                  ),
                  and(
                    not(isIgnored(device)),
                    hasAccessibleName(device, not(isEmpty))
                  )
                )
              )
            )
          );

        const roots = elements.groupBy(element => element.root());

        return flatMap(roots.values(), elements =>
          elements
            .reduce((groups, element) => {
              for (const [node] of Node.from(element, device)) {
                groups = groups.set(
                  node.name(),
                  groups
                    .get(node.name())
                    .getOrElse(() => List.empty<Element>())
                    .push(element)
                );
              }

              return groups;
            }, Map.empty<Option<string>, List<Element>>())
            .values()
        );
      },

      expectations(target) {
        const sources = Set.from(
          map(target, element =>
            element.attribute("href").map(attr => attr.value)
          )
        );

        return {
          1: expectation(
            sources.size === 1,
            Outcomes.ResolveSameResource,
            Question.of(
              "reference-equivalent-resources",
              "boolean",
              target,
              "Do the links resolve to equivalent resources?"
            ).map(embedEquivalentResources =>
              expectation(
                embedEquivalentResources,
                Outcomes.ResolveEquivalentResource,
                Outcomes.ResolveDifferentResource
              )
            )
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const ResolveSameResource = Ok.of(
    "The links resolve to the same resource"
  );

  export const ResolveEquivalentResource = Ok.of(
    "The links resolve to equivalent resources"
  );

  export const ResolveDifferentResource = Err.of(
    "The links do not resolve to the same or equivalent resources"
  );
}
