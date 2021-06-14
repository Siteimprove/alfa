import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { Map } from "@siteimprove/alfa-map";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import {
  hasNonEmptyAccessibleName,
  hasRole,
  isIgnored,
  referenceSameResource,
} from "../common/predicate";

import { Group } from "../common/group";
import { normalize } from "../common/normalize";
import { Question } from "../common/question";

const { isElement, hasNamespace } = Element;
const { flatten } = Iterable;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Group<Element>, Question>({
  uri: "https://alfa.siteimprove.com/rules/sia-r41",
  requirements: [Criterion.of("2.4.9")],
  evaluate({ device, document, response }) {
    return {
      applicability() {
        return flatten(
          document
            .descendants({ flattened: true, nested: true })
            .filter(isElement)
            .filter(
              and(
                hasNamespace(Namespace.HTML, Namespace.SVG),
                hasRole(device, (role) => role.is("link")),
                not(isIgnored(device)),
                hasNonEmptyAccessibleName(device)
              )
            )
            .groupBy((element) => element.root())
            .map((elements) =>
              elements
                .reduce((groups, element) => {
                  const name = Node.from(element, device).name.map((name) =>
                    normalize(name.value)
                  );

                  groups = groups.set(
                    name,
                    groups
                      .get(name)
                      .getOrElse(() => List.empty<Element>())
                      .append(element)
                  );

                  return groups;
                }, Map.empty<Option<string>, List<Element>>())
                .filter((elements) => elements.size > 1)
                .map(Group.of)
                .values()
            )
            .values()
        );
      },

      expectations(target) {
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
