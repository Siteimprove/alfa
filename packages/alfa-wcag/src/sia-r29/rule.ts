import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element, isRendered } from "@siteimprove/alfa-dom";

import { Audio } from "../helpers/applicabilities/audio";

export const SIA_R29: Atomic.Rule<Document | Device, Element> = {
  id: "sanshikan:rules/sia-r29.html",
  definition: (applicability, expectations, { document, device }) => {
    applicability(document, Audio(document, device));

    expectations((aspect, target, question) => {
      const alt = question(QuestionType.Node, "text-alternative");
      const label = question(QuestionType.Node, "label");

      return {
        1: { holds: alt === null ? null : isRendered(alt, document, device) },
        2: { holds: label === null ? null : true },
        3: {
          holds: label === null ? null : isRendered(label, document, device)
        }
      };
    });
  }
};
