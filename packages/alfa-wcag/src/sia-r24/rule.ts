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

export const SIA_R24: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r24.html",
  requirements: [{ id: "wcag:media-alternative-prerecorded", partial: true }],
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
      expectation(1, question("has-transcript"));
      expectation(2, question("transcript-is-sufficient"));
    });
  }
};

function isVideo(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "video"
  );
}
