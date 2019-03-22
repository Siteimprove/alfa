import { Composite, Outcome } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { SIA_R23 } from "../sia-r23/rule";
import { SIA_R29 } from "../sia-r29/rule";

export const SIA_R30: Composite.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r30.html",
  requirements: [
    { id: "wcag:audio-only-and-video-only-prerecorded", partial: true }
  ],
  composes: [SIA_R23, SIA_R29],
  definition: expectations => {
    expectations(results => {
      return {
        1: {
          holds:
            results.find(result => result.outcome === Outcome.Passed) !==
            undefined
        }
      };
    });
  }
};
