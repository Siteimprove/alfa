import { Atomic } from "@siteimprove/alfa-act";
import {
  Document,
  Element,
  getElementNamespace,
  hasTextContent,
  isElement,
  Namespace,
  Node,
  querySelector
} from "@siteimprove/alfa-dom";

export const SIA_R1: Atomic.Rule<Document, Document> = {
  id: "sanshikan:rules/sia-r1.html",
  requirements: ["wcag:page-titled"],
  definition: (applicability, expectations, { document }) => {
    applicability(() => (hasDocumentElement(document) ? [document] : null));

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

function hasDocumentElement(document: Document): boolean {
  const { childNodes } = document;

  for (let i = 0, n = childNodes.length; i < n; i++) {
    const childNode = childNodes[i];

    if (isElement(childNode) && childNode.localName === "html") {
      return true;
    }
  }

  return false;
}

function isTitle(element: Element, context: Node): boolean {
  if (getElementNamespace(element, context) !== Namespace.HTML) {
    return false;
  }

  return element.localName === "title";
}
