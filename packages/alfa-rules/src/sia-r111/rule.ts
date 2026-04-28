import { Rule } from "@siteimprove/alfa-act";
import type { Element } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.ts";
import { getApplicableTargets } from "../common/applicability/targets-of-pointer-events.ts";
import { getClickableRegion } from "../common/dom/get-clickable-region.ts";

import { WithName } from "../common/diagnostic.ts";

import { TargetSize } from "../common/outcome/target-size.ts";

import { hasSufficientSize } from "../common/predicate/has-sufficient-size.ts";
import { isUserAgentControlled } from "../common/predicate/is-user-agent-controlled.ts";

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r111",
  requirements: [Criterion.of("2.5.5")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getApplicableTargets(document, device);
      },

      expectations(target) {
        const clickableRegion = getClickableRegion(device, target);

        const name = WithName.getName(target, device).getOr("");
        return {
          1: expectation(
            isUserAgentControlled()(target),
            () => TargetSize.IsUserAgentControlled(name, clickableRegion),
            hasSufficientSize(44, device)(target)
              ? () => TargetSize.HasSufficientSize(name, clickableRegion)
              : () => TargetSize.HasInsufficientSize(name, clickableRegion),
          ),
        };
      },
    };
  },
});
