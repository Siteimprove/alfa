import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import { Attribute, Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { isElement, hasNamespace } = Element;
const { isEmpty } = Iterable;
const { not, equals, property } = Predicate;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Attribute<aria.Attribute.Name>>({
  uri: "https://alfa.siteimprove.com/rules/sia-r19",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants(Node.composedNested)
          .filter(isElement)
          .filter(hasNamespace(Namespace.HTML, Namespace.SVG))
          .flatMap((element) =>
            Sequence.from(element.attributes).filter(
              and(isAriaAttribute, property("value", not(isEmpty)))
            )
          );
      },

      expectations(target) {
        const { name, value } = target;
        const attribute = aria.Attribute.of(name, value);

        // The owner is ensured because the applicability search for elements and
        // then look for their attributes.
        const owner = target.owner.getUnsafe();

        return {
          1: expectation(
            isValid(attribute) && isRequiredRefValid(attribute, owner, device),
            () => Outcomes.HasValidValue,
            () => Outcomes.HasNoValidValue
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasValidValue = Ok.of(
    Diagnostic.of(`The attribute has a valid value`)
  );

  export const HasNoValidValue = Err.of(
    Diagnostic.of(`The attribute does not have a valid value`)
  );
}

const isAriaAttribute = property("name", aria.Attribute.isName) as Refinement<
  Attribute,
  Attribute<aria.Attribute.Name>
>;

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

/**
 * All ids that exist in the tree of a given root.
 */
const idsCache = Cache.empty<Node, Sequence<string>>();

function treeHasId(id: string, node: Node): boolean {
  // We absolutely need no traversal options here, because `id` are scoped to
  // trees, so we do not want to cross shadow or content boundaries.
  return idsCache
    .get(node.root(), () =>
      node
        .root()
        .descendants()
        .filter(isElement)
        .collect((elt) => elt.id)
    )
    .includes(id);
}

function isRequiredRefValid(
  attribute: aria.Attribute,
  owner: Element,
  device: Device
): boolean {
  for (const role of aria.Node.from(owner, device).role) {
    const { name, type, value } = attribute;

    if (role.name === "combobox" && name === "aria-controls") {
      // combobox only require aria-controls when opened, which we can't really detect
      // aria-controls is no more required in ARIA 1.3 (and authoring practices)
      // but that hasn't made it to ARIA 1.2 :-(
      // @see https://github.com/w3c/aria/pull/1335
      return true;
    }

    if (
      role.isAttributeRequired(name) &&
      (type === "id-reference" || type === "id-reference-list")
    ) {
      // This is a required attribute with an ID ref (list) value, one of the tokens
      // must exist has an ID in the same tree.
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
