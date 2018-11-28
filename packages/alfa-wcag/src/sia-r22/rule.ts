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

export const SIA_R22: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r22.html",
  requirements: [{ id: "wcag:captions-prerecorded", partial: true }],
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
      expectation(1, question("has-captions"));
    });
  }
};

function isVideo(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "video"
  );
}
