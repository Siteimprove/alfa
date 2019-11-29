import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { hasTextAlternative, isExposed } from "@siteimprove/alfa-aria";
import { Seq } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  getElementNamespace,
  hasAttribute,
  isElement,
  isVisible,
  Namespace,
  querySelectorAll
} from "@siteimprove/alfa-dom";

const { map } = BrowserSpecific;

export const SIA_R49: Atomic.Rule<Document | Device, Element> = {
  id: "ttps://siteimprove.github.io/sanshikan/rules/sia-r49.html",
  evaluate: ({ document, device }) => {
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
        const mechanism = question(
          QuestionType.Node,
          "audio-control-mechanism"
        );

        if (mechanism === null || mechanism === false) {
          const holds = mechanism;

          return {
            1: { holds },
            2: { holds }
          };
        }

        return map(isExposed(mechanism, document, device), isExposed => {
          return map(
            isElement(mechanism) &&
              hasTextAlternative(mechanism, document, device),
            hasTextAlternative => {
              return {
                1: {
                  holds: true
                },
                2: {
                  holds:
                    isVisible(mechanism, document, device) &&
                    isExposed &&
                    hasTextAlternative
                }
              };
            }
          );
        });
      }
    };
  }
};
