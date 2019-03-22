import { Atomic, QuestionType } from "@siteimprove/alfa-act";
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

export const SIA_R23: Atomic.Rule<Document | Device, Element> = {
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
      const hasTranscript = question(QuestionType.Boolean, "has-transcript");

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
