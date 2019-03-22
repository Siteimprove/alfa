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

export const Video: (
  document: Document,
  device: Device,
  options: { audio?: boolean }
) => Atomic.Applicability<Document, Element> = (
  document,
  device,
  options
) => question => {
  return querySelectorAll(document, document, node => {
    if (!isElement(node) || !isVideo(node, document)) {
      return false;
    }

    if (options.audio !== undefined) {
      const hasAudio = question(QuestionType.Boolean, "has-audio", node);

      if (hasAudio !== false) {
        return false;
      }
    }

    const isStreaming = question(QuestionType.Boolean, "is-streaming", node);

    if (isStreaming !== false) {
      return false;
    }

    return isRendered(node, document, device);
  });
};

function isVideo(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "video"
  );
}
