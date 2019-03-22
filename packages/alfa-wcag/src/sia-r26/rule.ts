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

export const SIA_R26: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r26.html",
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
      const hasTextAlternative = question(
        QuestionType.Boolean,
        "has-text-alternative"
      );
      const hasLabel = question(QuestionType.Boolean, "has-label");
      const labelIsVisible = question(QuestionType.Boolean, "label-is-visible");

      return {
        1: { holds: hasTextAlternative },
        2: { holds: hasLabel },
        3: { holds: labelIsVisible }
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
