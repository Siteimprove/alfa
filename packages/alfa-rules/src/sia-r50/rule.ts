import { Composite, Outcome } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { hasOutcome } from "../helpers/has-outcome";

import { SIA_R48 } from "../sia-r48/rule";
import { SIA_R49 } from "../sia-r49/rule";

export const SIA_R50: Composite.Rule<Document | Device, Element> = {
  id: "sanshikan:rules/sia-r50.html",
  requirements: [
    { requirement: "wcag", criterion: "audio-control", partial: true }
  ],
  compose: composition => {
    composition.add(SIA_R48).add(SIA_R49);
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
