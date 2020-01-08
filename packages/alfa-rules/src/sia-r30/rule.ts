import { Composite, Outcome } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { hasOutcome } from "../helpers/has-outcome";

import { SIA_R23 } from "../sia-r23/rule";
import { SIA_R29 } from "../sia-r29/rule";

export const SIA_R30: Composite.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r30.html",
  requirements: [
    {
      requirement: "wcag",
      criterion: "audio-only-and-video-only-prerecorded",
      partial: true
    }
  ],
  compose: composition => {
    composition.add(SIA_R23).add(SIA_R29);
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
