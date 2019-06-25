import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { Seq } from "@siteimprove/alfa-collection";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getElementNamespace,
  isElement,
  isVisible,
  Namespace,
  Node,
  querySelector,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const Video: (
  document: Document,
  device: Device,
  options: {
    audio?: { has: boolean };
    track?: { kind: "descriptions"; has: boolean };
  }
) => Atomic.Applicability<Document, Element> = (
  document,
  device,
  options
) => question => {
  return Seq(
    querySelectorAll<Element>(document, document, node => {
      if (!isElement(node) || !isVideo(node, document)) {
        return false;
      }

      if (options.track !== undefined) {
        const hasTrack =
          querySelector(
            node,
            document,
            `track[kind="${options.track.kind}"]`
          ) !== null;

        if (hasTrack !== options.track.has) {
          return false;
        }
      }

      return isVisible(node, document, device);
    })
  ).map(element => {
    const isStreaming = question(
      QuestionType.Boolean,
      "is-streaming",
      document,
      element,
      { global: true }
    );

    if (isStreaming === null) {
      return { applicable: null, aspect: document, target: element };
    }

    if (isStreaming) {
      return { applicable: false, aspect: document, target: element };
    }

    if (options.audio !== undefined) {
      const hasAudio = question(
        QuestionType.Boolean,
        "has-audio",
        document,
        element,
        { global: true }
      );

      if (hasAudio === null) {
        return { applicable: null, aspect: document, target: element };
      }

      if (hasAudio !== options.audio.has) {
        return { applicable: false, aspect: document, target: element };
      }
    }

    return {
      applicable: true,
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
