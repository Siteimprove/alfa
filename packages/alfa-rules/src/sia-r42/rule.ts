import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Array } from "@siteimprove/alfa-array";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { isElement, hasNamespace } = Element;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r42",
  requirements: [Criterion.of("1.3.1")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML, Namespace.SVG),
              not(isIgnored(device)),
              hasRole((role) => role.hasRequiredParent())
            )
          );
      },

      expectations(target) {
        const node = aria.Node.from(target, device);
        const role = node.role.map((role) => role.name).getOr("");
        const requiredParents = node.role
          .map((role) => role.requiredParent)
          .getOr([]);

        return {
          1: expectation(
            hasRequiredParent(device)(node),
            () => Outcomes.IsOwnedByContextRole(role, requiredParents),
            () => Outcomes.IsNotOwnedByContextRole(role, requiredParents)
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsOwnedByContextRole = (
    role: Role.Name | "",
    requiredParents: ReadonlyArray<ReadonlyArray<Role.Name>>
  ) =>
    Ok.of(
      RequiredParent.of(
        `The element is owned by an element of its required context role`,
        role,
        requiredParents
      )
    );

  export const IsNotOwnedByContextRole = (
    role: Role.Name | "",
    requiredParents: ReadonlyArray<ReadonlyArray<Role.Name>>
  ) =>
    Err.of(
      RequiredParent.of(
        `The element is not owned by an element of its required context role`,
        role,
        requiredParents
      )
    );
}

function hasRequiredParent(device: Device): Predicate<aria.Node> {
  return (node) => {
    return node.role
      .filter((role) => role.hasRequiredParent())
      .every((role) =>
        node.parent().some(isRequiredParent(role.requiredParent))
      );
  };
}

function isRequiredParent(
  requiredParent: ReadonlyArray<ReadonlyArray<Role.Name>>
): Predicate<aria.Node> {
  return (node) =>
    requiredParent.some((roles) => isRequiredParent(roles)(node));

  function isRequiredParent(
    requiredParent: ReadonlyArray<Role.Name>
  ): Predicate<aria.Node> {
    return (node) => {
      const [role, ...rest] = requiredParent;

      if (node.role.some(Role.hasName(role))) {
        return (
          rest.length === 0 ||
          node
            .parent()
            .filter((node) => isElement(node.node))
            .some(isRequiredParent(rest))
        );
      }

      return false;
    };
  }
}

class RequiredParent extends Diagnostic {
  public static of(
    message: string,
    role: Role.Name | "" = "",
    requiredParents: ReadonlyArray<ReadonlyArray<Role.Name>> = []
  ): RequiredParent {
    return new RequiredParent(message, role, requiredParents);
  }

  private readonly _role: Role.Name | "";
  private readonly _requiredParents: ReadonlyArray<ReadonlyArray<Role.Name>>;

  private constructor(
    message: string,
    role: Role.Name | "",
    requiredParents: ReadonlyArray<ReadonlyArray<Role.Name>>
  ) {
    super(message);
    this._role = role;
    this._requiredParents = requiredParents;
  }

  public get role(): Role.Name | "" {
    return this._role;
  }

  public get requiredParents(): ReadonlyArray<ReadonlyArray<Role.Name>> {
    return this._requiredParents;
  }

  public equals(value: RequiredParent): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof RequiredParent &&
      value._message === this._message &&
      value._role === this._role &&
      value._requiredParents.length === this._requiredParents.length &&
      Array.equals(value._requiredParents, this._requiredParents)
    );
  }

  public toJSON(): RequiredParent.JSON {
    return {
      ...super.toJSON(),
      role: this._role,
      requiredParents: Array.toJSON(
        this._requiredParents.map((ancestors) => Array.toJSON(ancestors))
      ),
    };
  }
}

namespace RequiredParent {
  export interface JSON extends Diagnostic.JSON {
    role: Role.Name | "";
    requiredParents: Array<Array<Role.Name>>;
  }
}
