import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { Video } from "../helpers/applicabilities/video";

export const SIA_R22: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r22.html",
  requirements: [{ id: "wcag:captions-prerecorded", partial: true }],
  definition: (applicability, expectations, { device, document }) => {
    applicability(document, Video(document, device, { audio: true }));

    expectations((aspect, target, question) => {
      return {
        1: { holds: question(QuestionType.Boolean, "has-captions") }
      };
    });
  }
};
