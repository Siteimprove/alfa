import { Composite, Outcome } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { hasOutcome } from "../helpers/has-outcome";

import { SIA_R24 } from "../sia-r24/rule";
import { SIA_R25 } from "../sia-r25/rule";
import { SIA_R31 } from "../sia-r31/rule";
import { SIA_R36 } from "../sia-r36/rule";

export const SIA_R38: Composite.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r38.html",
  requirements: [
    {
      requirement: "wcag",
      criterion: "audio-description-or-media-alternative-prerecorded",
      partial: true
    }
  ],
  compose: composition => {
    composition
      .add(SIA_R24)
      .add(SIA_R25)
      .add(SIA_R31)
      .add(SIA_R36);
  },
  evaluate: () => {
    return {
      expectations: results => {
        return {
          1: {
            holds: hasOutcome(results, Outcome.Passed)
              ? true
              : hasOutcome(results, Outcome.CantTell)
              ? null
              : false
          }
        };
      }
    };
  }
};
