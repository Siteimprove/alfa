import { Composite, Outcome } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { hasOutcome } from "../helpers/has-outcome";

import { SIA_R22 } from "../sia-r22/rule";
import { SIA_R31 } from "../sia-r31/rule";

export const SIA_R27: Composite.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r27.html",
  requirements: [{ id: "wcag:captions-prerecorded", partial: true }],
  compose: composition => {
    composition.add(SIA_R22).add(SIA_R31);
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
