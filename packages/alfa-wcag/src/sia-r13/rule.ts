import { Atomic } from "@siteimprove/alfa-act";
import { hasTextAlternative, isVisible } from "@siteimprove/alfa-aria";
import {
  Document,
  Element,
  getElementNamespace,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R13: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r13.html",
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
          isElement(node) &&
          isIframe(node, document) &&
          isVisible(node, document)
      )
    );

    expectations((target, expectation) => {
      expectation(1, hasTextAlternative(target, document));
    });
  }
};

function isIframe(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "iframe"
  );
}
