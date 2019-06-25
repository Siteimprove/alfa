import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { Video } from "../helpers/applicabilities/video";

export const SIA_R24: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r24.html",
  requirements: [
    {
      requirement: "wcag",
      criterion: "media-alternative-prerecorded",
      partial: true
    }
  ],
  evaluate: ({ device, document }) => {
    return {
      applicability: Video(document, device, { audio: { has: true } }),

      expectations: (aspect, target, question) => {
        return {
          1: { holds: question(QuestionType.Boolean, "has-transcript") }
        };
      }
    };
  }
};
