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

export const Audio: (
  document: Document,
  device: Device
) => Atomic.Applicability<Document, Element> = (
  document,
  device
) => question => {
  return querySelectorAll(document, document, node => {
    if (!isElement(node) || !isAudio(node, document)) {
      return false;
    }

    const isStreaming = question(QuestionType.Boolean, "is-streaming", node);

    if (isStreaming !== false) {
      return false;
    }

    const isPlaying = question(QuestionType.Boolean, "is-playing", node);

    if (isPlaying === true) {
      return true;
    }

    const playButton = question(QuestionType.Node, "play-button", node);

    if (playButton === null || !isElement(playButton)) {
      return false;
    }

    return isRendered(playButton, document, device);
  });
};

function isAudio(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "audio"
  );
}
