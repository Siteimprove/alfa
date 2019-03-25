import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { Video } from "../helpers/applicabilities/video";

export const SIA_R33: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r33.html",
  evaluate: ({ device, document }) => {
    return {
      applicability: Video(document, device, { audio: { has: false } }),

      expectations: (aspect, target, question) => {
        return {
          1: { holds: question(QuestionType.Boolean, "has-transcript") }
        };
      }
    };
  }
};
