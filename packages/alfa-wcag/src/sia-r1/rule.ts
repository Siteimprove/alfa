import { Atomic } from "@siteimprove/alfa-act";
import {
  Element,
  getElementNamespace,
  getParentNode,
  hasTextContent,
  isElement,
  Namespace,
  Node,
  querySelector,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R1: Atomic.Rule<"document", Element> = {
  id: "sanshikan:rules/sia-r1.html",
  requirements: ["wcag:page-titled"],
  definition: (applicability, expectations, { document }) => {
    applicability(() =>
      querySelectorAll(
        document,
        document,
        node => isElement(node) && isDocumentElement(node, document)
      )
    );

    expectations((target, expectation) => {
      const title = querySelector(
        target,
        document,
        node => isElement(node) && isTitle(node, document)
      );

      expectation(1, title !== null);

      if (title !== null) {
        expectation(2, hasTextContent(title, document));
      }
    });
  }
};

function isDocumentElement(element: Element, context: Node): boolean {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  return (
    element.localName === "html" && getParentNode(element, context) === context
  );
}

function isTitle(element: Element, context: Node): boolean {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  return element.localName === "title";
}
