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

export const SIA_R22: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r22.html",
  requirements: [{ id: "wcag:captions-prerecorded", partial: true }],
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
      const hasCaptions = question(QuestionType.Boolean, "has-captions");

      return {
        1: { holds: hasCaptions }
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
