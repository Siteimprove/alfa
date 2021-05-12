import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";
import { isFocusable } from "../common/predicate/is-focusable";
import { isIgnored } from "../common/predicate/is-ignored";

const { isElement, hasNamespace } = Element;
const { isEmpty } = Iterable;
const { and, not, property } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r16",
  requirements: [Criterion.of("4.1.2"), Technique.of("ARIA5")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ composed: true, nested: true })
          .filter(isElement)
          .filter(and(hasNamespace(Namespace.HTML, Namespace.SVG), hasRole()))
          .filter(not(isIgnored(device)));
      },

      expectations(target) {
        const node = Node.from(target, device);

        let role: string;

        if (node.role.isSome()) {
          role = node.role.get().name;
        } else {
          role = "";
        }

        return {
          1: expectation(
            hasRequiredValues(device)(target),
            () => Outcomes.HasAllStates(role),
            () => Outcomes.HasNotAllStates(role)
          ),
        };
      },
    };
  },
});

function hasRequiredValues(device: Device): Predicate<Element> {
  return (element) => {
    const node = Node.from(element, device);

    for (const role of node.role) {
      // The `separator` role is poorly architected in the sense that its
      // inheritance and attribute requirements depend on aspects of the element
      // carrying the role. If the element is not focusable, the `separator`
      // role has no required attributes.
      if (role.is("separator") && !isFocusable(device)(element)) {
        return true;
      }

      for (const attribute of role.attributes) {
        if (
          role.isAttributeRequired(attribute) &&
          node.attribute(attribute).every(property("value", isEmpty))
        ) {
          return false;
        }
      }
    }

    return true;
  };
}

class RoleAndRequiredAttributes extends Diagnostic {
  public static of(
    message: string,
    role: string = ""
  ): RoleAndRequiredAttributes {
    return new RoleAndRequiredAttributes(message, role);
  }

  private readonly _role: string;

  private constructor(message: string, role: string) {
    super(message);
    this._role = role;
  }

  public get role(): string {
    return this._role;
  }

  public equals(value: RoleAndRequiredAttributes): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof RoleAndRequiredAttributes &&
      value._message === this._message &&
      value._role === this._role
    );
  }

  public toJSON(): RoleAndRequiredAttributes.JSON {
    return {
      ...super.toJSON(),
      role: this._role,
    };
  }
}

namespace RoleAndRequiredAttributes {
  export interface JSON extends Diagnostic.JSON {
    role: string;
  }
}

export namespace Outcomes {
  export const HasAllStates = (role: string) =>
    Ok.of(
      RoleAndRequiredAttributes.of(
        `The element has all required states and properties`,
        role
      )
    );

  export const HasNotAllStates = (role: string) =>
    Err.of(
      RoleAndRequiredAttributes.of(
        `The element does not have all required states and properties`,
        role
      )
    );
}
