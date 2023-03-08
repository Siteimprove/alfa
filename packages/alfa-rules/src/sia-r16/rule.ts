import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM, Role } from "@siteimprove/alfa-aria";
import { Array } from "@siteimprove/alfa-array";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err, Result } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { Scope } from "../tags";

const { hasNonDefaultRole, isIncludedInTheAccessibilityTree } = DOM;
const { hasAttribute, hasInputType, hasName, hasNamespace } = Element;
const { isEmpty } = Iterable;
const { and, property, test } = Predicate;
const { isFocusable } = Style;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r16",
  requirements: [
    Criterion.of("1.3.1"),
    Criterion.of("4.1.2"),
    Technique.of("ARIA5"),
  ],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .elementDescendants(Node.composedNested)
          .filter(
            and(hasNamespace(Namespace.HTML, Namespace.SVG), hasNonDefaultRole)
          )
          .filter(isIncludedInTheAccessibilityTree(device));
      },

      expectations(target) {
        return { 1: hasRequiredValues(device, target) };
      },
    };
  },
});

function hasRequiredValues(
  device: Device,
  element: Element
): Result<RoleAndRequiredAttributes> {
  const node = aria.Node.from(element, device);

  for (const role of node.role) {
    // The `separator` role is poorly architected in the sense that its
    // inheritance and attribute requirements depend on aspects of the element
    // carrying the role. If the element is not focusable, the `separator`
    // role has no required attributes.
    if (role.is("separator") && !isFocusable(device)(element)) {
      return Outcomes.HasAllStates(role.name, [], []);
    }

    const required = role.requiredAttributes;
    const missing: Array<aria.Attribute.Name> = [];
    let result = true;

    for (const attribute of required) {
      // We need to keep going through all attributes to gather all the missing
      // ones
      if (
        node.attribute(attribute).every(property("value", isEmpty)) &&
        !isManagedAttribute(element, role.name, attribute) &&
        !isAttributeOptional(role.name, attribute)
      ) {
        missing.push(attribute);
        result = false;
      }
    }

    return result
      ? Outcomes.HasAllStates(role.name, required, missing)
      : Outcomes.HasNotAllStates(role.name, required, missing);
  }

  // If there is no role for the node, we have a problem; applicability ensures
  // the presence of a role. Throwing a Failed result to trigger looking into it
  return Outcomes.RuleError;
}

/**
 * @internal
 */
export class RoleAndRequiredAttributes extends Diagnostic {
  public static of(message: string): Diagnostic;

  public static of(
    message: string,
    role: Role.Name,
    requiredAttributes: ReadonlyArray<aria.Attribute.Name>,
    missingAttributes: ReadonlyArray<aria.Attribute.Name>
  ): RoleAndRequiredAttributes;

  public static of(
    message: string,
    role?: Role.Name,
    requiredAttributes?: ReadonlyArray<aria.Attribute.Name>,
    missingAttributes?: ReadonlyArray<aria.Attribute.Name>
  ): Diagnostic {
    return role === undefined
      ? Diagnostic.of(message)
      : new RoleAndRequiredAttributes(
          message,
          role,
          // Presence is ensured by the overload
          requiredAttributes!,
          missingAttributes!
        );
  }

  private readonly _role: Role.Name;
  private readonly _requiredAttributes: ReadonlyArray<aria.Attribute.Name>;
  private readonly _missingAttributes: ReadonlyArray<aria.Attribute.Name>;

  private constructor(
    message: string,
    role: Role.Name,
    requiredAttributes: ReadonlyArray<aria.Attribute.Name>,
    missingAttributes: ReadonlyArray<aria.Attribute.Name>
  ) {
    super(message);
    this._role = role;
    this._requiredAttributes = requiredAttributes;
    this._missingAttributes = missingAttributes;
  }

  public get role(): Role.Name {
    return this._role;
  }

  public get requiredAttributes(): ReadonlyArray<aria.Attribute.Name> {
    return this._requiredAttributes;
  }

  public get missingAttributes(): ReadonlyArray<aria.Attribute.Name> {
    return this._missingAttributes;
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

  public hash(hash: Hash) {
    super.hash(hash);
    hash.writeString(this._role);
    this._requiredAttributes.forEach((attr) => hash.writeString(attr));
    this._missingAttributes.forEach((attr) => hash.writeString(attr));
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

/**
 * @internal
 */
export namespace RoleAndRequiredAttributes {
  export interface JSON extends Diagnostic.JSON {
    role: string;
    attributes: {
      required: Array<aria.Attribute.Name>;
      missing: Array<aria.Attribute.Name>;
    };
  }

  export function isRoleAndRequiredAttributes(
    value: Diagnostic
  ): value is RoleAndRequiredAttributes;

  export function isRoleAndRequiredAttributes(
    value: unknown
  ): value is RoleAndRequiredAttributes;

  export function isRoleAndRequiredAttributes(
    value: unknown
  ): value is RoleAndRequiredAttributes {
    return value instanceof RoleAndRequiredAttributes;
  }
}

export namespace Outcomes {
  export const HasAllStates = (
    role: Role.Name,
    required: ReadonlyArray<aria.Attribute.Name>,
    missing: ReadonlyArray<aria.Attribute.Name>
  ) =>
    Ok.of(
      RoleAndRequiredAttributes.of(
        "The element has all required states and properties",
        role,
        required,
        missing
      )
    );

  export const HasNotAllStates = (
    role: Role.Name,
    required: ReadonlyArray<aria.Attribute.Name>,
    missing: ReadonlyArray<aria.Attribute.Name>
  ) =>
    Err.of(
      RoleAndRequiredAttributes.of(
        "The element does not have all required states and properties",
        role,
        required,
        missing
      )
    );

  // This should never happen
  export const RuleError = Err.of(
    RoleAndRequiredAttributes.of("", "generic", [], [])
  );
}

// Some aria-* attributes are managed by UAs out of the HTML AAM and we
// incorrectly flagged them as missing
// See https://github.com/w3c/html-aam/issues/349
function isManagedAttribute(
  element: Element,
  role: aria.Role.Name,
  attribute: aria.Attribute.Name
): boolean {
  if (
    role === "combobox" &&
    attribute === "aria-expanded" &&
    test(
      and(
        hasName("input"),
        hasInputType("email", "search", "tel", "text", "url"),
        hasAttribute("list")
      ),
      element
    )
  ) {
    return true;
  }

  return false;
}

function isAttributeOptional(
  role: aria.Role.Name,
  attribute: aria.Attribute.Name
) {
  // combobox only requires aria-controls when opened, which we can't detect
  // same as for sia-r19, @see https://github.com/Siteimprove/alfa/pull/1313
  // should be refined to look at `aria-expanded` at some point
  return role === "combobox" && attribute === "aria-controls";
}
