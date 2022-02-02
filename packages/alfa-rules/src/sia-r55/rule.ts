import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Node, Role } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { Group } from "../common/act/group";
import { Question } from "../common/act/question";

import { normalize } from "../common/normalize";
import { hasRole, isIgnored } from "../common/predicate";

import { Scope } from "../tags";

const { and, equals, not } = Predicate;
const { hasNamespace } = Element;

export default Rule.Atomic.of<Page, Group<Element>, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r55",
  tags: [Scope.Component],
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

class WithRole extends Diagnostic {
  public static of(message: string, role: Role.Name = "none"): WithRole {
    return new WithRole(message, role);
  }

  private readonly _role: Role.Name;

  private constructor(message: string, role: Role.Name) {
    super(message);
    this._role = role;
  }

  public get role(): Role.Name {
    return this._role;
  }

  public equals(value: WithRole): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithRole &&
      value._message === this._message &&
      value._role === this._role
    );
  }

  public toJSON(): WithRole.JSON {
    return {
      ...super.toJSON(),
      role: this._role,
    };
  }
}

namespace WithRole {
  export interface JSON extends Diagnostic.JSON {
    role: string;
  }

  export function isWithRole(value: unknown): value is WithRole {
    return value instanceof WithRole;
  }
}
