import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Node, Role } from "@siteimprove/alfa-aria";
import { Element, Namespace, Query } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { String } from "@siteimprove/alfa-string";
import { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation.js";
import { Group } from "../common/act/group.js";
import { Question } from "../common/act/question.js";
import { WithRole } from "../common/diagnostic/with-role.js";

import { Scope, Stability } from "../tags/index.js";

const {
  hasIncorrectRoleWithoutName,
  hasRole,
  isIncludedInTheAccessibilityTree,
} = DOM;
const { hasNamespace } = Element;
const { and, equals } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Group<Element>, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r55",
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return (
          getElementDescendants(document, dom.Node.fullTree)
            .filter(
              and(
                hasNamespace(equals(Namespace.HTML)),
                isIncludedInTheAccessibilityTree(device),
                hasRole(device, (role) => role.is("landmark")),
              ),
            )
            // circumventing https://github.com/Siteimprove/alfa/issues/298
            .reject(hasIncorrectRoleWithoutName(device))
            // We first group by name, under the assumption that duplicated
            // names are less frequent than duplicated roles.
            .groupBy((landmark) =>
              Node.from(landmark, device).name.map((name) =>
                String.normalize(name.value),
              ),
            )
            .filter((landmarks) => landmarks.size > 1)
            // Next, we group by role.
            .flatMap((sameName) =>
              sameName
                // We have filtered by having a role, and can safely get it.
                .groupBy((landmark) =>
                  Node.from(landmark, device).role.getUnsafe(),
                ),
            )
            .filter((elements) => elements.size > 1)
            .map(Group.of)
            .values()
        );
      },

      expectations(target) {
        // Empty groups have been filtered out already, so we can safely get the
        // first element
        const first = Node.from(Iterable.first(target).getUnsafe(), device);
        const role = first.role.map((role) => role.name).getOr("generic");
        const name = first.name.map((name) => name.value).getOr("");

        const sameResource = Question.of(
          "is-content-equivalent",
          target,
          `Do these ${role} landmarks have the same or equivalent content?`,
          {
            diagnostic: WithRoleAndName.of(
              `Do these ${role} landmarks have the same or equivalent content?`,
              role,
              name,
            ),
          },
        );

        return {
          1: sameResource.map((same) =>
            expectation(
              same,
              () => Outcomes.SameResource(role, name),
              () => Outcomes.DifferentResources(role, name),
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
  export const SameResource = (role: Role.Name, name: string) =>
    Ok.of(
      WithRoleAndName.of(
        `No two \`${role}\` have the same name and different content.`,
        role,
        name,
      ),
    );

  export const DifferentResources = (role: Role.Name, name: string) =>
    Err.of(
      WithRoleAndName.of(
        `Some \`${role}\` have the same name and different content.`,
        role,
        name,
      ),
    );
}

/**
 * @public
 */
export class WithRoleAndName extends WithRole {
  public static of(message: string): Diagnostic;

  public static of(message: string, role: Role.Name): WithRole;

  public static of(
    message: string,
    role: Role.Name,
    name: string,
  ): WithRoleAndName;

  public static of(
    message: string,
    role?: Role.Name,
    name?: string,
  ): Diagnostic {
    return role === undefined
      ? new Diagnostic(message)
      : name === undefined
        ? new WithRole(message, role)
        : new WithRoleAndName(message, role, name);
  }

  private readonly _name: string;

  private constructor(message: string, role: Role.Name, name: string) {
    super(message, role);
    this._name = name;
  }

  public get name(): string {
    return this._name;
  }

  public equals(value: WithRoleAndName): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithRoleAndName &&
      value._message === this._message &&
      value._role === this._role &&
      value._name === this._name
    );
  }

  public toJSON(): WithRoleAndName.JSON {
    return {
      ...super.toJSON(),
      name: this._name,
    };
  }
}

/**
 * @public
 */
export namespace WithRoleAndName {
  export interface JSON extends WithRole.JSON {
    name: string;
  }

  export function isWithRoleAndName(
    value: Diagnostic,
  ): value is WithRoleAndName;

  export function isWithRoleAndName(value: unknown): value is WithRoleAndName;

  /**@public */
  export function isWithRoleAndName(value: unknown): value is WithRoleAndName {
    return value instanceof WithRoleAndName;
  }
}
