import { Composite, Outcome } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { hasOutcome } from "../helpers/has-outcome";

import { SIA_R26 } from "../sia-r26/rule";
import { SIA_R32 } from "../sia-r32/rule";
import { SIA_R33 } from "../sia-r33/rule";
import { SIA_R34 } from "../sia-r34/rule";

export const SIA_R35: Composite.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r35.html",
  requirements: [
    {
      requirement: "wcag",
      criterion: "audio-only-and-video-only-prerecorded",
      partial: true
    }
  ],
  compose: composition => {
    composition
      .add(SIA_R26)
      .add(SIA_R32)
      .add(SIA_R33)
      .add(SIA_R34);
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
