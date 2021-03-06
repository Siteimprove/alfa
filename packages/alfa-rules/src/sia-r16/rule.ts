import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Node } from "@siteimprove/alfa-aria";
import { Array } from "@siteimprove/alfa-array";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err, Result } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

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
          .filter(
            and(hasNamespace(Namespace.HTML, Namespace.SVG), hasRole(device))
          )
          .filter(not(isIgnored(device)));
      },

      expectations(target) {
        const diagnostic = hasRequiredValues(device, target);

        return {
          1: expectation(
            diagnostic.isOk(),
            () => Outcomes.HasAllStates(diagnostic.get()),
            () => Outcomes.HasNotAllStates(diagnostic.getErr())
          ),
        };
      },
    };
  },
});

function hasRequiredValues(
  device: Device,
  element: Element
): Result<RoleAndRequiredAttributes> {
  let result = true;

  const node = Node.from(element, device);

  let roleName: string = "";
  let required: Array<aria.Attribute.Name> = [];
  let missing: Array<aria.Attribute.Name> = [];

  for (const role of node.role) {
    roleName = role.name;
    // The `separator` role is poorly architected in the sense that its
    // inheritance and attribute requirements depend on aspects of the element
    // carrying the role. If the element is not focusable, the `separator`
    // role has no required attributes.
    if (role.is("separator") && !isFocusable(device)(element)) {
      return Ok.of(
        RoleAndRequiredAttributes.of("", roleName, required, missing)
      );
    }

    for (const attribute of role.attributes) {
      if (role.isAttributeRequired(attribute)) {
        required.push(attribute);

        if (node.attribute(attribute).every(property("value", isEmpty))) {
          missing.push(attribute);
          result = false;
        }
      }
    }
  }

  return result
    ? Ok.of(RoleAndRequiredAttributes.of("", roleName, required, missing))
    : Err.of(RoleAndRequiredAttributes.of("", roleName, required, missing));
}

export class RoleAndRequiredAttributes extends Diagnostic {
  public static of(
    message: string,
    role: string = "",
    requiredAttributes: ReadonlyArray<aria.Attribute.Name> = [],
    missingAttributes: ReadonlyArray<aria.Attribute.Name> = []
  ): RoleAndRequiredAttributes {
    return new RoleAndRequiredAttributes(
      message,
      role,
      requiredAttributes,
      missingAttributes
    );
  }

  private readonly _role: string;
  private readonly _requiredAttributes: ReadonlyArray<aria.Attribute.Name>;
  private readonly _missingAttributes: ReadonlyArray<aria.Attribute.Name>;

  private constructor(
    message: string,
    role: string,
    requiredAttributes: ReadonlyArray<aria.Attribute.Name>,
    missingAttributes: ReadonlyArray<aria.Attribute.Name>
  ) {
    super(message);
    this._role = role;
    this._requiredAttributes = requiredAttributes;
    this._missingAttributes = missingAttributes;
  }

  public get role(): string {
    return this._role;
  }

  public get requiredAttributes(): ReadonlyArray<aria.Attribute.Name> {
    return this._requiredAttributes;
  }

  public get missingAttributes(): ReadonlyArray<aria.Attribute.Name> {
    return this._missingAttributes;
  }

  public withMessage(message: string): RoleAndRequiredAttributes {
    return new RoleAndRequiredAttributes(
      message,
      this._role,
      this._requiredAttributes,
      this._missingAttributes
    );
  }

  public equals(value: RoleAndRequiredAttributes): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof RoleAndRequiredAttributes &&
      value._message === this._message &&
      value._role === this._role &&
      Array.equals(value._requiredAttributes, this._requiredAttributes) &&
      Array.equals(value._missingAttributes, this._missingAttributes)
    );
  }

  public toJSON(): RoleAndRequiredAttributes.JSON {
    return {
      ...super.toJSON(),
      role: this._role,
      attributes: {
        required: Array.copy(this._requiredAttributes),
        missing: Array.copy(this._missingAttributes),
      },
    };
  }
}

namespace RoleAndRequiredAttributes {
  export interface JSON extends Diagnostic.JSON {
    role: string;
    attributes: {
      required: Array<aria.Attribute.Name>;
      missing: Array<aria.Attribute.Name>;
    };
  }
}

export namespace Outcomes {
  export const HasAllStates = (diagnostic: RoleAndRequiredAttributes) =>
    Ok.of(
      diagnostic.withMessage(
        `The element has all required states and properties`
      )
    );

  export const HasNotAllStates = (diagnostic: RoleAndRequiredAttributes) =>
    Err.of(
      diagnostic.withMessage(
        `The element does not have all required states and properties`
      )
    );
}
