import { Atomic } from "@siteimprove/alfa-act";
import { hasTextAlternative, isExposed } from "@siteimprove/alfa-aria";
import { some } from "@siteimprove/alfa-compatibility";
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
    applicability(document, () => {
      return querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) &&
          isIframe(node, document) &&
          some(isExposed(node, document, device))
      );
    });

    expectations((aspect, target) => {
      return {
        1: { holds: hasTextAlternative(target, document, device) }
      };
    });
  }
};

function isIframe(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "iframe"
  );
}
