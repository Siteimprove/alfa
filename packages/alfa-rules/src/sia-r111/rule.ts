import { Rule } from "@siteimprove/alfa-act";
import type { Element } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";
import { applicableTargetsOfPointerEvents } from "../common/applicability/targets-of-pointer-events.js";
import { getClickableRegion } from "../common/dom/get-clickable-region.js";

import { WithName } from "../common/diagnostic.js";

import { TargetSize } from "../common/outcome/target-size.js";

import { hasSufficientSize } from "../common/predicate/has-sufficient-size.js";
import { isUserAgentControlled } from "../common/predicate/is-user-agent-controlled.js";

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r111",
  requirements: [Criterion.of("2.5.5")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return applicableTargetsOfPointerEvents(document, device);
      },

      expectations(target) {
        // Existence of a clickable box is guaranteed by applicability
        const box = getClickableRegion(device, target).getUnsafe();
        const name = WithName.getName(target, device).getOr("");
        return {
          1: expectation(
            isUserAgentControlled()(target),
            () =>
              // TODO: How should we send to the clickable region?
              TargetSize.IsUserAgentControlled(name, box.first().getUnsafe()),
            hasSufficientSize(44, device)(target)
              ? () =>
                  TargetSize.HasSufficientSize(name, box.first().getUnsafe())
              : () =>
                  TargetSize.HasInsufficientSize(name, box.first().getUnsafe()),
          ),
        };
      },
    };
  },
});
