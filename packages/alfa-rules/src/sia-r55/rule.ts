import { Rule } from "@siteimprove/alfa-act";
import { DOM, Node, Role } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation";
import { Group } from "../common/act/group";
import { Question } from "../common/act/question";
import { WithRole } from "../common/diagnostic/with-role";

import { normalize } from "../common/normalize";

import { Scope } from "../tags";

const {
  hasIncorrectRoleWithoutName,
  hasRole,
  isIncludedInTheAccessibilityTree,
} = DOM;
const { hasNamespace, isElement } = Element;
const { and, equals } = Predicate;

export default Rule.Atomic.of<Page, Group<Element>, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r55",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return (
          document
            .descendants(dom.Node.fullTree)
            .filter(isElement)
            .filter(
              and(
                hasNamespace(equals(Namespace.HTML)),
                isIncludedInTheAccessibilityTree(device),
                hasRole(device, (role) => role.is("landmark"))
              )
            )
            // circumventing https://github.com/Siteimprove/alfa/issues/298
            .reject(hasIncorrectRoleWithoutName(device))
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
      WithRole.of(
        `No two \`${role}\` have the same name and different content.`,
        role
      )
    );

  export const DifferentResources = (role: Role.Name) =>
    Err.of(
      WithRole.of(
        `Some \`${role}\` have the same name and different content.`,
        role
      )
    );
}
