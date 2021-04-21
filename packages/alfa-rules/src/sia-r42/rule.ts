import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Array } from "@siteimprove/alfa-array";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
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

        const foundParents = hasRequiredParent(device, node);

        return {
          1: expectation(
            !Array.isEmpty(foundParents),
            () =>
              Outcomes.IsOwnedByContextRole(
                role,
                requiredParents,
                foundParents
              ),
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
    requiredParents: ReadonlyArray<ReadonlyArray<Role.Name>>,
    foundParents: ReadonlyArray<Role.Name>
  ) =>
    Ok.of(
      RequiredParent.of(
        `The element is owned by an element of its required context role`,
        role,
        requiredParents,
        foundParents
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

function hasRequiredParent(
  device: Device,
  node: aria.Node
): ReadonlyArray<Role.Name> {
  return node.role
    .filter((role) => role.hasRequiredParent())
    .flatMap((role) =>
      node
        .parent()
        .flatMap((parent) =>
          Array.find(role.requiredParent, (req) =>
            isRequiredParent(req)(parent)
          )
        )
    )
    .getOr([]);
}

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

class RequiredParent extends Diagnostic {
  public static of(
    message: string,
    role: Role.Name | "" = "",
    requiredParents: ReadonlyArray<ReadonlyArray<Role.Name>> = [],
    foundParents: ReadonlyArray<Role.Name> = []
  ): RequiredParent {
    return new RequiredParent(message, role, requiredParents, foundParents);
  }

  private readonly _role: Role.Name | "";
  private readonly _requiredParents: ReadonlyArray<ReadonlyArray<Role.Name>>;
  private readonly _foundParents: ReadonlyArray<Role.Name>;

  private constructor(
    message: string,
    role: Role.Name | "",
    requiredParents: ReadonlyArray<ReadonlyArray<Role.Name>>,
    foundParents: ReadonlyArray<Role.Name>
  ) {
    super(message);
    this._role = role;
    this._requiredParents = requiredParents;
    this._foundParents = foundParents;
  }

  public get role(): Role.Name | "" {
    return this._role;
  }

  public get requiredParents(): ReadonlyArray<ReadonlyArray<Role.Name>> {
    return this._requiredParents;
  }

  public get foundParents(): ReadonlyArray<Role.Name> {
    return this._foundParents;
  }

  public equals(value: RequiredParent): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof RequiredParent &&
      value._message === this._message &&
      value._role === this._role &&
      Array.equals(value._requiredParents, this._requiredParents) &&
      Array.equals(value._foundParents, this._foundParents)
    );
  }

  public toJSON(): RequiredParent.JSON {
    return {
      ...super.toJSON(),
      role: this._role,
      requiredParents: Array.toJSON(
        this._requiredParents.map((ancestors) => Array.toJSON(ancestors))
      ),
      foundParents: Array.toJSON(this._foundParents),
    };
  }
}

namespace RequiredParent {
  export interface JSON extends Diagnostic.JSON {
    role: Role.Name | "";
    requiredParents: Array<Array<Role.Name>>;
    foundParents: Array<Role.Name>;
  }
}
