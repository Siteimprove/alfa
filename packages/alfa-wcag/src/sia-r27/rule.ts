import { Composite, Outcome } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";

import { SIA_R22 } from "../sia-r22/rule";
import { SIA_R26 } from "../sia-r26/rule";

export const SIA_R27: Composite.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r27.html",
  requirements: [{ id: "wcag:captions-prerecorded", partial: true }],
  composes: [SIA_R22, SIA_R26],
  definition: expectations => {
    expectations((results, expectation) => {
      expectation(
        1,
        results.find(result => result.outcome === Outcome.Passed) !== undefined
      );
    });
  }
};
