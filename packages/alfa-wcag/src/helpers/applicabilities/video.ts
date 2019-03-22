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
  return querySelectorAll<Element>(
    document,
    document,
    node => isElement(node) && isVideo(node, document)
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

    if (options.audio !== undefined) {
      const hasAudio = question(
        QuestionType.Boolean,
        "has-audio",
        document,
        element
      );

      if (hasAudio === null) {
        return { applicable: null, aspect: document, target: element };
      }

      if (hasAudio !== options.audio) {
        return { applicable: false, aspect: document, target: element };
      }
    }

    return {
      applicable: isRendered(element, document, device),
      aspect: document,
      target: element
    };
  });
};

function isVideo(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "video"
  );
}
