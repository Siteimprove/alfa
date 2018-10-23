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
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R11: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r11.html",
  requirements: [
    { id: "wcag:link-purpose-in-context", partial: true },
    { id: "wcag:name-role-value", partial: true }
  ],
  definition: (applicability, expectations, { document }) => {
    applicability(() =>
      querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) && isLink(node, document) && isVisible(node, document)
      )
    );

    expectations((target, expectation) => {
      expectation(1, hasTextAlternative(target, document));
    });
  }
};

function isLink(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    some(getRole(element, context), role => role === Roles.Link)
  );
}
