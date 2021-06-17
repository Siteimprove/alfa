import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Node, Role } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { Group } from "../common/group";
import { normalize } from "../common/normalize";

import { hasRole, isIgnored } from "../common/predicate";
import { Question } from "../common/question";

const { and, equals, not } = Predicate;
const { hasNamespace } = Element;

export default Rule.Atomic.of<Page, Group<Element>, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r55.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return (
          document
            .descendants({ flattened: true, nested: true })
            .filter(Element.isElement)
            .filter(
              and(
                hasNamespace(equals(Namespace.HTML)),
                not(isIgnored(device)),
                hasRole(device, (role) => role.is("landmark"))
              )
            )
            // We first group by name, under the assumption that duplicated
            // names are less frequent than duplicated roles.
            .groupBy((landmark) =>
              Node.from(landmark, device).name.map((name) =>
                normalize(name.value)
              )
            )
            .filter((landmarks) => landmarks.size > 1)
            // Next, we group by role.
            .flatMap((sameName) =>
              sameName
                // We have filtered by having a role, and can safely get it.
                .groupBy((landmark) => Node.from(landmark, device).role.get())
            )
            .filter((elements) => elements.size > 1)
            .map(Group.of)
            .values()
        );
      },

      expectations(target) {
        // Empty groups have been filtered out already, so we can safely get the
        // first element
        const role = Node.from(Iterable.first(target).get(), device).role.get()
          .name;

        const sameResource = Question.of(
          "is-content-equivalent",
          "boolean",
          target,
          `Do these ${role} landmarks have the same or equivalent content?`
        );

        return {
          1: sameResource.map((same) =>
            expectation(
              same,
              () => Outcomes.SameResource(role),
              () => Outcomes.DifferentResources(role)
            )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const SameResource = (role: Role.Name) =>
    Ok.of(
      Diagnostic.of(
        `No two \`${role}\` have the same name and different content.`
      )
    );

  export const DifferentResources = (role: Role.Name) =>
    Err.of(
      Diagnostic.of(
        `Some \`${role}\` have the same name and different content.`
      )
    );
}
