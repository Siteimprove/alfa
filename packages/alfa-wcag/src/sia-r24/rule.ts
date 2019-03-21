import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
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

export const SIA_R24: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r24.html",
  requirements: [{ id: "wcag:media-alternative-prerecorded", partial: true }],
  definition: (applicability, expectations, { device, document }) => {
    applicability(document, () => {
      return querySelectorAll(
        document,
        document,
        node =>
          isElement(node) &&
          isRendered(node, document, device) &&
          isVideo(node, document)
      );
    });

    expectations((aspect, target, question) => {
      const hasTranscript = question(QuestionType.Boolean, "has-transcripts");
      const transcriptIsSufficient = question(
        QuestionType.Boolean,
        "transcript-is-sufficient"
      );

      return {
        1: { holds: hasTranscript },
        2: { holds: transcriptIsSufficient }
      };
    });
  }
};

function isVideo(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "video"
  );
}
