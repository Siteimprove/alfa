import { Atomic } from "@siteimprove/alfa-act";
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
    applicability(document, () =>
      querySelectorAll(
        document,
        document,
        node =>
          isElement(node) &&
          isRendered(node, document, device) &&
          isVideo(node, document)
      )
    );

    expectations((aspect, target, expectation, question) => {
      const hasTranscript = question(1);
      const transcriptIsSufficient = question(2);

      expectation(1, hasTranscript);
      expectation(2, transcriptIsSufficient);
    });
  }
};

function isVideo(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "video"
  );
}
