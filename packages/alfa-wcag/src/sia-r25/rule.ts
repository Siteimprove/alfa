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

export const SIA_R25: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r25.html",
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
      expectation(1, question("audio-is-sufficient"));
    });
  }
};

function isVideo(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "video"
  );
}
