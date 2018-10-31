import { Atomic } from "@siteimprove/alfa-act";
import {
  Document,
  Element,
  getElementNamespace,
  isElement,
  isRendered,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R26: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r26.html",
  definition: (applicability, expectations, { document }) => {
    applicability(() =>
      querySelectorAll(
        document,
        document,
        node =>
          isElement(node) &&
          isRendered(node, document) &&
          isVideo(node, document)
      )
    );

    expectations((target, expectation, question) => {
      expectation(1, question("has-text-alternative"));
      expectation(2, question("has-label"));
      expectation(3, question("label-is-visible"));
    });
  }
};

function isVideo(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "video"
  );
}
