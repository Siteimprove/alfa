import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import {
  Attribute,
  Element,
  Namespace,
  Node,
  Query,
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/act/expectation";
import { isAriaControlsOptional } from "../common/predicate/is-aria-controls-optional";

import { Scope, Stability } from "../tags";

const { hasNamespace } = Element;
const { isEmpty } = Iterable;
const { and, not, equals, property } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r19",
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.composedNested)
          .filter(hasNamespace(Namespace.HTML, Namespace.SVG))
          .flatMap((element) =>
            Sequence.from(element.attributes).filter(
              and(
                property("name", aria.Attribute.isName),
                property("value", not(isEmpty))
              )
            )
          );
      },

      expectations(target) {
        // We know from the Applicability that this is an `aria-*` attribute.
        const { name, value } = target as Attribute<aria.Attribute.Name>;
        const attribute = aria.Attribute.of(name, value);

        // The owner is ensured because the applicability search for elements and
        // then look for their attributes.
        const owner = target.owner.getUnsafe();

        return {
          1: expectation(
            isValid(attribute) &&
              isAttributeOptionalOrValid(attribute, owner, device),
            () => Outcomes.HasValidValue,
            () => Outcomes.HasNoValidValue
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
  export const HasValidValue = Ok.of(
    Diagnostic.of(`The attribute has a valid value`)
  );

  export const HasNoValidValue = Err.of(
    Diagnostic.of(`The attribute does not have a valid value`)
  );
}

function isValid(attribute: aria.Attribute): boolean {
  const { type, value, options } = attribute;

  switch (type) {
    case "true-false":
      return value === "true" || value === "false";

    case "true-false-undefined":
      return value === "true" || value === "false" || value === "undefined";

    case "tristate":
      return value === "true" || value === "false" || value === "mixed";

    case "id-reference":
      return !/\s+/.test(value);

    case "id-reference-list":
      return true;

    case "integer":
      return /^[+-]?\d+$/.test(value);

    case "number":
      return /^[+-]?\d+(\.\d+)?$/.test(value);

    case "string":
      return true;

    case "token":
      return value === "undefined" || options.some(equals(value));

    case "token-list":
      return value.split(/\s+/).every((value) => options.some(equals(value)));
  }
}

function treeHasId(id: string, node: Node): boolean {
  return Query.getElementIdMap(node).has(id);
}

/**
 * false if an aria-* attribute is:
 * * required on its owner's role; and
 * * of type id reference (list); and
 * * pointing to non-existing id; and
 * * not `aria-controls` on closed `combobox`, which is an exception.
 */
function isAttributeOptionalOrValid(
  attribute: aria.Attribute,
  owner: Element,
  device: Device
): boolean {
  const node = aria.Node.from(owner, device);
  for (const role of node.role) {
    const { name, type, value } = attribute;

    if (isAriaControlsOptional(node) && name === "aria-controls") {
      return true;
    }

    if (
      role.isAttributeRequired(name) &&
      (type === "id-reference" || type === "id-reference-list")
    ) {
      // This is a required attribute with an ID ref (list) value, one of the tokens
      // must exist as an ID in the same tree.
      // Note: as of ARIA 1.2, this is only aria-controls on scrollbar…
      return value.split(" ").some((token) => treeHasId(token.trim(), owner));
    }

    // The attribute either is not required, or does not have an ID ref (list) type,
    // so this is good
    return true;
  }

  // The owner has no role, so this is good
  return true;
}
