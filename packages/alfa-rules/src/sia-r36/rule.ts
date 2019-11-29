import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { Video } from "../helpers/applicabilities/video";

export const SIA_R36: Atomic.Rule<Device | Document, Element> = {
  id: "ttps://siteimprove.github.io/sanshikan/rules/sia-r36.html",
  evaluate: ({ device, document }) => {
    return {
      applicability: Video(document, device, {
        audio: { has: true },
        track: { has: true, kind: "descriptions" }
      }),

      expectations: (aspect, target, question) => {
        return {
          1: { holds: question(QuestionType.Boolean, "track-describes-video") }
        };
      }
    };
  }
};
