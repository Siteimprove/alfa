import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { Video } from "../helpers/applicabilities/video";

import { EN } from "./locales/en";

export const SIA_R22: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r22.html",
  requirements: [{ id: "wcag:captions-prerecorded", partial: true }],
  locales: [EN],
  evaluate: ({ device, document }) => {
    return {
      applicability: Video(document, device, { audio: { has: true } }),

      expectations: (aspect, target, question) => {
        return {
          1: { holds: question(QuestionType.Boolean, "has-captions") }
        };
      }
    };
  }
};
