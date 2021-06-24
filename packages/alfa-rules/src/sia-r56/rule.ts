import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Node, Role } from "@siteimprove/alfa-aria";
import { Array } from "@siteimprove/alfa-array";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { Group } from "../common/group";
import { normalize } from "../common/normalize";

import { hasRole, isIgnored } from "../common/predicate";

const { and, equals, not } = Predicate;
const { hasNamespace } = Element;

export default Rule.Atomic.of<Page, Group<Element>>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r56.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(Element.isElement)
          .filter(
            and(
              hasNamespace(equals(Namespace.HTML)),
              not(isIgnored(device)),
              hasRole(device, (role) => role.is("landmark"))
            )
          )
          .groupBy((landmark) => Node.from(landmark, device).role.get())
          .filter((elements) => elements.size > 1)
          .map(Group.of)
          .values();
      },

      expectations(target) {
        // Empty groups have been filtered out already, so we can safely get the
        // first element
        const role = Node.from(Iterable.first(target).get(), device).role.get()
          .name;

        const byNames = List.from(target)
          .groupBy((landmark) =>
            Node.from(landmark, device).name.map((name) =>
              normalize(name.value)
            )
          )
          .filter((landmarks) => landmarks.size > 1);

        return {
          1: expectation(
            byNames.size === 0,
            () => Outcomes.differentNames(role),
            () => Outcomes.sameNames(role, byNames.values())
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const differentNames = (role: Role.Name) =>
    Ok.of(SameNames.of(`No two \`${role}\` have the same name.`, role, []));

  export const sameNames = (
    role: Role.Name,
    errors: Iterable<Iterable<Element>>
  ) =>
    Err.of(SameNames.of(`Some \`${role}\` have the same name.`, role, errors));
}

class SameNames extends Diagnostic implements Iterable<List<Element>> {
  public static of(
    message: string,
    role: Role.Name = "none",
    errors: Iterable<Iterable<Element>> = []
  ): SameNames {
    return new SameNames(message, role, Array.from(errors).map(List.from));
  }

  private readonly _role: Role.Name;
  private readonly _errors: ReadonlyArray<List<Element>>;

  private constructor(
    message: string,
    role: Role.Name,
    errors: ReadonlyArray<List<Element>>
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

  public toJSON(): SameNames.JSON {
    return {
      ...super.toJSON(),
      role: this._role,
      errors: Array.toJSON(this._errors),
    };
  }
}

namespace SameNames {
  export interface JSON extends Diagnostic.JSON {
    role: string;
    errors: Array<List.JSON<Element>>;
  }

  export function isSameNames(value: unknown): value is SameNames {
    return value instanceof SameNames;
  }
}
