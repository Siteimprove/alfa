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
  return querySelectorAll<Element>(
    document,
    document,
    node => isElement(node) && isAudio(node, document)
  ).map(element => {
    const isStreaming = question(
      QuestionType.Boolean,
      "is-streaming",
      document,
      element
    );

    if (isStreaming === null || isStreaming === true) {
      return { applicable: isStreaming, aspect: document, target: element };
    }

    const isPlaying = question(
      QuestionType.Boolean,
      "is-playing",
      document,
      element
    );

    if (isPlaying === true) {
      return { applicable: isPlaying, aspect: document, target: element };
    }

    const playButton = question(
      QuestionType.Node,
      "play-button",
      document,
      element
    );

    if (playButton === null) {
      return { applicable: null, aspect: document, target: element };
    }

    return {
      applicable:
        isElement(playButton) && isRendered(playButton, document, device),
      aspect: document,
      target: element
    };
  });
};

function isAudio(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "audio"
  );
}
