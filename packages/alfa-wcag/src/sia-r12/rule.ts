import { Atomic } from "@siteimprove/alfa-act";
import {
  getRole,
  hasTextAlternative,
  isVisible,
  Roles
} from "@siteimprove/alfa-aria";
import { some } from "@siteimprove/alfa-compatibility";
import {
  Document,
  Element,
  getElementNamespace,
  getInputType,
  InputType,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R12: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r12.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  definition: (applicability, expectations, { document }) => {
    applicability(() =>
      querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) &&
          isButton(node, document) &&
          isVisible(node, document) &&
          getInputType(node) !== InputType.Image
      )
    );

    expectations((target, expectation) => {
      expectation(1, hasTextAlternative(target, document));
    });
  }
};

function isButton(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    some(getRole(element, context), role => role === Roles.Button)
  );
}
