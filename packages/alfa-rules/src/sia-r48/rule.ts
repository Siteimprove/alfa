import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { Seq } from "@siteimprove/alfa-collection";
import {
  Document,
  Element,
  getElementNamespace,
  hasAttribute,
  isElement,
  Namespace,
  querySelectorAll
} from "@siteimprove/alfa-dom";

export const SIA_R48: Atomic.Rule<Document, Element> = {
  id: "sanshikan:rules/sia-r48.html",
  evaluate: ({ document }) => {
    return {
      applicability: question => {
        return Seq(
          querySelectorAll<Element>(document, document, node => {
            if (!isElement(node)) {
              return false;
            }

            if (getElementNamespace(node, document) !== Namespace.HTML) {
              return false;
            }

            if (node.localName !== "video" && node.localName !== "audio") {
              return false;
            }

            if (!hasAttribute(node, "autoplay")) {
              return false;
            }

            if (hasAttribute(node, "paused") || hasAttribute(node, "muted")) {
              return false;
            }

            return true;
          })
        ).map(element => {
          const hasAudio = question(
            QuestionType.Boolean,
            "has-audio",
            document,
            element,
            { global: true }
          );

          if (hasAudio === null || hasAudio === false) {
            return { applicable: hasAudio, aspect: document, target: element };
          }

          const isAboveAutoplayDurationThreshold = question(
            QuestionType.Boolean,
            "is-above-duration-threshold",
            document,
            element,
            { global: true }
          );

          return {
            applicable: isAboveAutoplayDurationThreshold,
            aspect: document,
            target: element
          };
        });
      },

      expectations: (aspect, target, question) => {
        return {
          1: {
            holds: question(
              QuestionType.Boolean,
              "is-below-audio-duration-threshold"
            )
          }
        };
      }
    };
  }
};
