import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import type { Role } from "@siteimprove/alfa-aria";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Array } from "@siteimprove/alfa-array";
import { Element, Namespace, Query } from "@siteimprove/alfa-dom";
import type { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { String } from "@siteimprove/alfa-string";
import type { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation.js";
import { Group } from "../common/act/group.js";
import { ARIA } from "../requirements/index.js";

import { Scope, Stability } from "../tags/index.js";

const {
  hasIncorrectRoleWithoutName,
  hasRole,
  isIncludedInTheAccessibilityTree,
} = DOM;
const { hasNamespace } = Element;
const { and, equals } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Group<Element>>({
  uri: "https://alfa.siteimprove.com/rules/sia-r56",
  requirements: [
    ARIA.of(
      "https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/#aria_lh_step3",
    ),
  ],
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
            // We have already filter by having a landmark role.
            .groupBy((landmark) => Node.from(landmark, device).role.getUnsafe())
            .filter((elements) => elements.size > 1)
            .map(Group.of)
            .values()
        );
      },

      expectations(target) {
        // Empty groups have been filtered out already, so we can safely get the
        // first element
        const role = Node.from(Iterable.first(target).getUnsafe(), device)
          .role.map((role) => role.name)
          .getOr("generic");

        const byNames = List.from(target)
          .groupBy((landmark) =>
            Node.from(landmark, device).name.map((name) =>
              String.normalize(name.value),
            ),
          )
          .filter((landmarks) => landmarks.size > 1);

        return {
          1: expectation(
            byNames.size === 0,
            () => Outcomes.differentNames(role),
            () => Outcomes.sameNames(role, byNames.values()),
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
  export const differentNames = (role: Role.Name) =>
    Ok.of(SameNames.of(`No two \`${role}\` have the same name.`, role, []));

  export const sameNames = (
    role: Role.Name,
    errors: Iterable<Iterable<Element>>,
  ) =>
    Err.of(SameNames.of(`Some \`${role}\` have the same name.`, role, errors));
}

/**
 * @public
 */
export class SameNames extends Diagnostic implements Iterable<List<Element>> {
  public static of(
    message: string,
    role: Role.Name = "none",
    errors: Iterable<Iterable<Element>> = [],
  ): SameNames {
    return new SameNames(message, role, Array.from(errors).map(List.from));
  }

  private readonly _role: Role.Name;
  private readonly _errors: ReadonlyArray<List<Element>>;

  protected constructor(
    message: string,
    role: Role.Name,
    errors: ReadonlyArray<List<Element>>,
  ) {
    super(message);
    this._role = role;
    this._errors = errors;
  }

  public get role(): Role.Name {
    return this._role;
  }

  public *[Symbol.iterator](): Iterator<List<Element>> {
    yield* this._errors;
  }

  public equals(value: SameNames): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof SameNames &&
      value._message === this._message &&
      value._role === this._role &&
      value._errors.every((list, idx) => list.equals(this._errors[idx]))
    );
  }

  public hash(hash: Hash) {
    super.hash(hash);
    hash.writeString(this._role);
    this._errors.forEach((element) => element.hash(hash));
  }

  public toJSON(options?: dom.Node.SerializationOptions): SameNames.JSON {
    return {
      ...super.toJSON(options),
      role: this._role,
      errors: Array.toJSON(this._errors, options),
    };
  }
}

/**
 * @public
 */
export namespace SameNames {
  export interface JSON extends Diagnostic.JSON {
    role: string;
    errors: Array<List.JSON<Element>>;
  }

  export function isSameNames(value: Diagnostic): value is SameNames;

  export function isSameNames(value: unknown): value is SameNames;

  /**@public */
  export function isSameNames(value: unknown): value is SameNames {
    return value instanceof SameNames;
  }
}
