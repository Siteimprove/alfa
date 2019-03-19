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
    applicability(document, () => {
      return querySelectorAll(
        document,
        document,
        node => isElement(node) && isAudio(node, document)
      );
    });

    expectations((aspect, target, question) => {
      const hasTranscript = question(1);

      return {
        1: { holds: hasTranscript }
      };
    });
  }
};

function isAudio(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "audio"
  );
}
