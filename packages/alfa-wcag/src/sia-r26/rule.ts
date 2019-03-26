import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, isRendered } from "@siteimprove/alfa-dom";

import { Video } from "../helpers/applicabilities/video";

export const SIA_R26: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r26.html",
  evaluate: ({ device, document }) => {
    return {
      applicability: Video(document, device, { audio: { has: false } }),

      expectations: (aspect, target, question) => {
        const alt = question(QuestionType.Node, "text-alternative");
        const label = question(QuestionType.Node, "label");

        return {
          1: { holds: alt === null ? null : isRendered(alt, document, device) },
          2: { holds: label === null ? null : true },
          3: {
            holds: label === null ? null : isRendered(label, document, device)
          }
        };
      }
    };
  }
};
