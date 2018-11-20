import { Atomic } from "@siteimprove/alfa-act";
import { hasTextAlternative, isVisible } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getElementNamespace,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R13: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r13.html",
  requirements: [
    { id: "wcag:link-purpose-in-context", partial: true },
    { id: "wcag:name-role-value", partial: true }
  ],
  definition: (applicability, expectations, { device, document }) => {
    applicability(() =>
      querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) &&
          isIframe(node, document) &&
          isVisible(node, document, device)
      )
    );

    expectations((target, expectation) => {
      expectation(1, hasTextAlternative(target, document, device));
    });
  }
};

function isIframe(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "iframe"
  );
}
