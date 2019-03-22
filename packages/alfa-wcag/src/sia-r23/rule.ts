import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { Audio } from "../helpers/applicabilities/audio";

export const SIA_R23: Atomic.Rule<Document | Device, Element> = {
  id: "sanshikan:rules/sia-r23.html",
  requirements: [{ id: "wcag:captions-prerecorded", partial: true }],
  evaluate: ({ document, device }) => {
    return {
      applicability: Audio(document, device),

      expectations: (aspect, target, question) => {
        return {
          1: { holds: question(QuestionType.Boolean, "has-transcript") }
        };
      }
    };
  }
};
