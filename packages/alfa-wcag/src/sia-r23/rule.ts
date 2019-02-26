import { Atomic } from "@siteimprove/alfa-act";
import {
  Document,
  Element,
  getElementNamespace,
  isElement,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R23: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r23.html",
  requirements: [{ id: "wcag:captions-prerecorded", partial: true }],
  definition: (applicability, expectations, { document }) => {
    applicability(document, () =>
      querySelectorAll(
        document,
        document,
        node => isElement(node) && isAudio(node, document)
      )
    );

    expectations((aspect, target, expectation, question) => {
      const hasCaptions = question(1);

      expectation(1, hasCaptions);
    });
  }
};

function isAudio(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "audio"
  );
}
