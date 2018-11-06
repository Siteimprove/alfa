import { Atomic } from "@siteimprove/alfa-act";
import {
  getTextAlternative,
  hasTextAlternative,
  isVisible
} from "@siteimprove/alfa-aria";
import { some } from "@siteimprove/alfa-compatibility";
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

export const SIA_R15: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r15.html",
  requirements: [{ id: "wcag:name-role-value", partial: true }],
  definition: (applicability, expectations, { document }) => {
    applicability(() =>
      querySelectorAll<Element>(
        document,
        document,
        node =>
          isElement(node) &&
          isIframe(node, document) &&
          isVisible(node, document) &&
          hasTextAlternative(node, document)
      )
    );

    expectations((target, expectation) => {
      const rootNode = getRootNode(target, document);

      expectation(
        1,
        some(
          getTextAlternative(target, document),
          textAlternative =>
            querySelector(
              rootNode,
              document,
              node =>
                node !== target &&
                isElement(node) &&
                isIframe(node, document) &&
                getAttribute(node, "src") !== getAttribute(target, "src") &&
                isVisible(node, document) &&
                some(
                  getTextAlternative(node, document),
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
