import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";

import R26 from "../sia-r26/rule";
import R32 from "../sia-r32/rule";
import R33 from "../sia-r33/rule";
import R34 from "../sia-r34/rule";

export const SIA_R35: Composite.Rule<Device | Document, Element> = {
  id: "sanshikan:rules/sia-r35.html",
  composes: [R26, R32, R33, R34],
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
