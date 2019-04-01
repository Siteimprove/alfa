import { Atomic, QuestionType } from "@siteimprove/alfa-act";
import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { Video } from "../helpers/applicabilities/video";
import { isPerceivable } from "../helpers/is-perceivable";

const { map } = BrowserSpecific;

export const SIA_R26: Atomic.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r26.html",
  evaluate: ({ device, document }) => {
    return {
      applicability: Video(document, device, { audio: { has: false } }),

      expectations: (aspect, target, question) => {
        const alt = question(QuestionType.Node, "text-alternative");
        const label = question(QuestionType.Node, "label");

        return map(isPerceivable(alt, document, device), isAltPerceivable => {
          return map(
            isPerceivable(label, document, device),
            isLabelPerceivable => {
              return {
                1: { holds: alt === null ? null : isAltPerceivable },
                2: { holds: label === null ? null : true },
                3: { holds: label === null ? null : isLabelPerceivable }
              };
            }
          );
        });
      }
    };
  }
};
