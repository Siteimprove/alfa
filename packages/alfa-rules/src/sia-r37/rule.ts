import { Composite, Outcome } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { hasOutcome } from "../helpers/has-outcome";

import { SIA_R25 } from "../sia-r25/rule";
import { SIA_R31 } from "../sia-r31/rule";
import { SIA_R36 } from "../sia-r36/rule";

export const SIA_R37: Composite.Rule<Device | Document, Element> = {
  id: "ttps://siteimprove.github.io/sanshikan/rules/sia-r37.html",
  requirements: [
    {
      requirement: "wcag",
      criterion: "audio-description-prerecorded",
      partial: true
    }
  ],
  compose: composition => {
    composition
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
          }
        };
      }
    };
  }
};
