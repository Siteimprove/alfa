import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { isExposed } from "@siteimprove/alfa-aria";
import { List } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getElementNamespace,
  isElement,
  isVisible,
  Namespace,
  Node,
  querySelectorAll
} from "@siteimprove/alfa-dom";

const { map } = BrowserSpecific;
const { filter } = BrowserSpecific.Iterable;

export const Audio: (
  document: Document,
  device: Device
) => Atomic.Applicability<Document, Element> = (
  document,
  device
) => question => {
  return map(
    filter(
      querySelectorAll<Element>(document, document, node => {
        return isElement(node) && isAudio(node, document);
      }),
      element => {
        return isExposed(element, document, device);
      }
    ),
    elements => {
      return List(elements).map(element => {
        const isStreaming = question(
          QuestionType.Boolean,
          "is-streaming",
          document,
          element
        );

        if (isStreaming === null) {
          return { applicable: null, aspect: document, target: element };
        }

        if (isStreaming) {
          return { applicable: false, aspect: document, target: element };
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

        if (
          playButton === false ||
          !isElement(playButton) ||
          !isVisible(playButton, document, device)
        ) {
          return { applicable: false, aspect: document, target: element };
        }

        return { applicable: true, aspect: document, target: element };
      });
    }
  );
};

function isAudio(element: Element, context: Node): boolean {
  return (
    getElementNamespace(element, context) === Namespace.HTML &&
    element.localName === "audio"
  );
}
