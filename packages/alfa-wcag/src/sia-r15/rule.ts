import { Atomic } from "@siteimprove/alfa-act";
import {
  getTextAlternative,
  hasTextAlternative,
  isVisible
} from "@siteimprove/alfa-aria";
import { some } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getAttribute,
  getElementNamespace,
  getRootNode,
  isElement,
  Namespace,
  Node,
  querySelector,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R15: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r15.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  definition: (applicability, expectations, { device, document }) => {
    applicability(document, () =>
      querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) &&
          isIframe(node, document) &&
          isVisible(node, document, device) &&
          hasTextAlternative(node, document, device)
      )
    );

    expectations((aspect, target, expectation) => {
      const rootNode = getRootNode(target, document);

      expectation(
        1,
        some(
          getTextAlternative(target, document, device),
          textAlternative =>
            querySelector(
              rootNode,
              document,
              node =>
                node !== target &&
                isElement(node) &&
                isIframe(node, document) &&
                getAttribute(node, "src") !== getAttribute(target, "src") &&
                isVisible(node, document, device) &&
                some(
                  getTextAlternative(node, document, device),
                  otherTextAlternative =>
                    otherTextAlternative !== null &&
                    otherTextAlternative.trim().toLowerCase() ===
                      textAlternative!.trim().toLowerCase()
                )
            ) === null
        )
      );
    });
  }
};

function isIframe(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "iframe"
  );
}
